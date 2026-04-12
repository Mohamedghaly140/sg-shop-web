import RedirectToast from "@/components/shared/redirect-toast";
import React from "react";

interface RootTemplateProps {
  children: React.ReactNode;
}

const RootTemplate = ({ children }: RootTemplateProps) => {
  return (
    <>
      <>{children}</>
      <RedirectToast />
    </>
  );
};

export default RootTemplate;
