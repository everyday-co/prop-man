import { useLingui } from '@lingui/react/macro';

import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

import { StyledPMParagraph } from '../components/PMParagraph';

export const PMInspectionsPage = () => {
  const { t } = useLingui();

  return (
    <PageContainer>
      <PageHeader title={t`Inspections`} />
      <PageBody>
        <StyledPMParagraph>
          {t`Move-in/out, annual, and custom inspection workflows will be orchestrated from this page.`}
        </StyledPMParagraph>
      </PageBody>
    </PageContainer>
  );
};
