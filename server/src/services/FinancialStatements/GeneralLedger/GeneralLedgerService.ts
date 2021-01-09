import { Service, Inject } from 'typedi';
import moment from 'moment';
import { ServiceError } from 'exceptions';
import { difference } from 'lodash';
import { IGeneralLedgerSheetQuery } from 'interfaces';
import TenancyService from 'services/Tenancy/TenancyService';
import Journal from 'services/Accounting/JournalPoster';
import GeneralLedgerSheet from 'services/FinancialStatements/GeneralLedger/GeneralLedger';

const ERRORS = {
  ACCOUNTS_NOT_FOUND: 'ACCOUNTS_NOT_FOUND',
};

@Service()
export default class GeneralLedgerService {
  @Inject()
  tenancy: TenancyService;

  @Inject('logger')
  logger: any;

  /**
   * Defaults general ledger report filter query.
   * @return {IBalanceSheetQuery}
   */
  get defaultQuery() {
    return {
      fromDate: moment().startOf('year').format('YYYY-MM-DD'),
      toDate: moment().endOf('year').format('YYYY-MM-DD'),
      basis: 'cash',
      numberFormat: {
        noCents: false,
        divideOn1000: false,
      },
      noneZero: false,
      accountsIds: [],
    };
  }

  /**
   * Validates accounts existance on the storage.
   * @param {number} tenantId
   * @param {number[]} accountsIds
   */
  async validateAccountsExistance(tenantId: number, accountsIds: number[]) {
    const { Account } = this.tenancy.models(tenantId);

    const storedAccounts = await Account.query().whereIn('id', accountsIds);
    const storedAccountsIds = storedAccounts.map((a) => a.id);

    if (difference(accountsIds, storedAccountsIds).length > 0) {
      throw new ServiceError(ERRORS.ACCOUNTS_NOT_FOUND);
    }
  }

  /**
   * Retrieve general ledger report statement.
   * ----------
   * @param {number} tenantId
   * @param {IGeneralLedgerSheetQuery} query
   * @return {IGeneralLedgerStatement}
   */
  async generalLedger(
    tenantId: number,
    query: IGeneralLedgerSheetQuery
  ): Promise<{
    data: any;
    query: IGeneralLedgerSheetQuery;
  }> {
    const {
      accountRepository,
      transactionsRepository,
    } = this.tenancy.repositories(tenantId);
    const settings = this.tenancy.settings(tenantId);

    const filter = {
      ...this.defaultQuery,
      ...query,
    };
    this.logger.info('[general_ledger] trying to calculate the report.', {
      tenantId,
      filter,
    });
    const baseCurrency = settings.get({
      group: 'organization',
      key: 'base_currency',
    });

    // Retrieve all accounts from the storage.
    const accounts = await accountRepository.all('type');
    const accountsGraph = await accountRepository.getDependencyGraph();

    // Retreive journal transactions from/to the given date.
    const transactions = await transactionsRepository.journal({
      fromDate: filter.fromDate,
      toDate: filter.toDate,
    });
    // Retreive opening balance credit/debit sumation.
    const openingBalanceTrans = await transactionsRepository.journal({
      toDate: filter.fromDate,
      sumationCreditDebit: true,
    });
    // Retreive closing balance credit/debit sumation.
    const closingBalanceTrans = await transactionsRepository.journal({
      toDate: filter.toDate,
      sumationCreditDebit: true,
    });
    // Transform array transactions to journal collection.
    const transactionsJournal = Journal.fromTransactions(
      transactions,
      tenantId,
      accountsGraph
    );
    const openingTransJournal = Journal.fromTransactions(
      openingBalanceTrans,
      tenantId,
      accountsGraph
    );
    const closingTransJournal = Journal.fromTransactions(
      closingBalanceTrans,
      tenantId,
      accountsGraph
    );
    // General ledger report instance.
    const generalLedgerInstance = new GeneralLedgerSheet(
      tenantId,
      filter,
      accounts,
      transactionsJournal,
      openingTransJournal,
      closingTransJournal,
      baseCurrency
    );
    // Retrieve general ledger report data.
    const reportData = generalLedgerInstance.reportData();

    return {
      data: reportData,
      query: filter,
    };
  }
}
