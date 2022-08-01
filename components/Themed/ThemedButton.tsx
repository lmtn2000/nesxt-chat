import { Button, ButtonProps } from "@chakra-ui/react";
import { useContext } from "react";
import { ThemeContext } from "../../pages/_app";

interface IButtonProps extends ButtonProps {
  label?: string;
}

const ThemedButton = ({ label, ...props }: IButtonProps) => {
  const theme = useContext(ThemeContext);
  return (
    <Button variant={theme === "dark" ? "outline" : "solid"} {...props}>
      {label}
    </Button>
  );
};

export default ThemedButton;
