import moment from 'moment';
import { SaleInvoice } from 'models';
import TenantRepository from 'repositories/TenantRepository';

export default class SaleInvoiceRepository extends TenantRepository {
  /**
   * Gets the repository's model.
   */
  get model() {
    return SaleInvoice.bindKnex(this.knex);
  }

  dueInvoices(asDate = moment().format('YYYY-MM-DD'), withRelations) {
    const cacheKey = this.getCacheKey('dueInvoices', asDate, withRelations);

    return this.cache.get(cacheKey, async () => {
      return this.model
        .query()
        .modify('dueInvoices')
        .modify('notOverdue', asDate)
        .modify('fromDate', asDate)
        .withGraphFetched(withRelations);
    });
  }

  overdueInvoices(asDate = moment().format('YYYY-MM-DD'), withRelations) {
    const cacheKey = this.getCacheKey('overdueInvoices', asDate, withRelations);

    return this.cache.get(cacheKey, () => {
      return this.model
        .query()
        .modify('dueInvoices')
        .modify('overdue', asDate)
        .modify('fromDate', asDate)
        .withGraphFetched(withRelations);
    });
  }
}
