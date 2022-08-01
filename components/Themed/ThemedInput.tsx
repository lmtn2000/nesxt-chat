import { Input, InputProps } from "@chakra-ui/react";

interface IInputProps extends InputProps {}

const ThemedInput = ({ ...props }: IInputProps) => {
  return <Input {...props} />;
};

export default ThemedInput;
