import { useLingui } from '@lingui/react/macro';

import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

import { StyledPMParagraph } from '../components/PMParagraph';

export const PMAccountingPage = () => {
  const { t } = useLingui();

  return (
    <PageContainer>
      <PageHeader title={t`Accounting`} />
      <PageBody>
        <StyledPMParagraph>
          {t`This page will surface rent roll, charges, payments, and delinquency workflows across the portfolio.`}
        </StyledPMParagraph>
      </PageBody>
    </PageContainer>
  );
};
