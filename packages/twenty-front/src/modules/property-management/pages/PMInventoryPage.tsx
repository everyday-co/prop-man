import { useLingui } from '@lingui/react/macro';

import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

import { StyledPMParagraph } from '../components/PMParagraph';

export const PMInventoryPage = () => {
  const { t } = useLingui();

  return (
    <PageContainer>
      <PageHeader title={t`Inventory`} />
      <PageBody>
        <StyledPMParagraph>
          {t`Track appliances, supplies, and turn readiness across every property. Inventory planning views will land here.`}
        </StyledPMParagraph>
      </PageBody>
    </PageContainer>
  );
};
