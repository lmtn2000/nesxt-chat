import { Box, Center, Flex, Icon, Input } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "../../styles/Home.module.css";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ThemedButton from "../Themed/ThemedButton";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

const schema = yup
  .object({
    email: yup.string().required().email()
  })
  .required();

const MailSubmission = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [helpText, setHelpText] = useState<string>("");
  const formRef = useRef<any>();
  const URL = process.env.NEXT_PUBLIC_API_URL;

  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
    setFocus
  } = useForm<{
    email: string;
  }>({
    resolver: yupResolver(schema),
    defaultValues: { email: "" }
  });

  const login = useGoogleLogin({
    onSuccess: async ({ code }) => {
      try {
        const response = await fetch(`${URL}/user/google`, {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            code
          })
        });
        const data = await response.json();
        setValue("email", data.email);
        setFocus("email");
        setHelpText("Submit email to login");
      } catch (error) {
        setHelpText("Try again later!");
      }
    },
    flow: "auth-code"
  });

  const onSubmit = handleSubmit(async formData => {
    try {
      setLoading(true);
      const { status } = await fetch(`${URL}/user/register`, {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          email: formData.email
        })
      });
      setLoading(false);

      if (status === 400) {
        setHelpText("Your email haven't registered yet!");
        return;
      }

      formRef?.current?.reset();
      setHelpText("Check your mail box!");
    } catch (error) {
      setLoading(false);

      setHelpText("Try again later!");
    }
  });

  return (
    <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
      <p className={styles.description}>Your email to chat</p>
      <div className={styles.grid}>
        <form ref={formRef} onSubmit={onSubmit}>
          <Flex>
            <Input
              placeholder="email"
              className={styles.card}
              {...register("email")}
            />
            <ThemedButton
              isLoading={loading}
              type="submit"
              label={"Send"}
              className={styles.card}
            />
          </Flex>
          <Center>{errors.email?.message || helpText}</Center>
        </form>
      </div>
      <Center>
        <ThemedButton
          label="Register with Google"
          isLoading={loading}
          className={styles.card}
          onClick={() => login()}
          leftIcon={<Icon w={8} h={8} as={FcGoogle} />}
        />
      </Center>
    </Box>
  );
};

export default MailSubmission;
