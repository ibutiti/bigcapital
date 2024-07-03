// @ts-nocheck
import { useAppQueryString } from '@/hooks';
import { Group } from '@/components';
import { useAccountTransactionsContext } from './AccountTransactionsProvider';
import { TagsControl } from '@/components/TagsControl';

export function AccountTransactionsUncategorizeFilter() {
  const { bankAccountMetaSummary } = useAccountTransactionsContext();
  const [locationQuery, setLocationQuery] = useAppQueryString();

  const totalUncategorized =
    bankAccountMetaSummary?.totalUncategorizedTransactions;
  const totalRecognized = bankAccountMetaSummary?.totalRecognizedTransactions;

  const handleTabsChange = (value) => {
    setLocationQuery({ uncategorizedFilter: value });
  };

  return (
    <Group position={'apart'}>
      <TagsControl
        options={[
          {
            value: 'all',
            label: (
              <>
                All <strong>({totalUncategorized})</strong>
              </>
            ),
          },
          {
            value: 'recognized',
            label: (
              <>
                Recognized <strong>({totalRecognized})</strong>
              </>
            ),
          },
        ]}
        value={locationQuery?.uncategorizedFilter || 'all'}
        onValueChange={handleTabsChange}
      />
      <TagsControl
        options={[{ value: 'excluded', label: 'Excluded' }]}
        value={locationQuery?.uncategorizedFilter || 'all'}
        onValueChange={handleTabsChange}
      />
    </Group>
  );
}
