"use client";

import { memo } from "react";



const PureAPIKeyInput = () => {
  return (
        <></>  
    )
};

const APIKeyInput = memo(PureAPIKeyInput, () => {
  // Always return false to prevent re-renders
  return false;
});

export default APIKeyInput;