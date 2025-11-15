import styled from '@emotion/styled';

export const StyledPMParagraph = styled.p`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  margin: 0;
`;
