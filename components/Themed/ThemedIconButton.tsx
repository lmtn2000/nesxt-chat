import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { useContext } from "react";
import { ThemeContext } from "../../pages/_app";

const ThemedIconButton = ({ ...props }: IconButtonProps) => {
  const theme = useContext(ThemeContext);
  return (
    <IconButton variant={theme === "dark" ? "outline" : "solid"} {...props} />
  );
};

export default ThemedIconButton;
