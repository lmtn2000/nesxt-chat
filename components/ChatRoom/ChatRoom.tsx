import {
  Avatar,
  Box,
  Center,
  Flex,
  Input,
  Spinner,
  Tooltip,
  Text
} from "@chakra-ui/react";
import moment from "moment";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { SocketContext } from "../../pages/_app";
import styles from "../../styles/Home.module.css";
import ThemedButton from "../Themed/ThemedButton";
import ThemedIconButton from "../Themed/ThemedIconButton";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";

interface Message {
  message: string;
  time: Date;
  email: string;
  loading: boolean;
  avatar: string;
  name: string;
}

const ChatRoom = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [scrollView, setScrollView] = useState<{
    top: boolean;
    bottom: boolean;
  }>({
    top: false,
    bottom: false
  });

  const formRef = useRef<any>();
  const topChatRef = useRef<any>();
  const bottomChatRef = useRef<any>();

  const URL = process.env.NEXT_PUBLIC_API_URL;
  const socket = useContext(SocketContext);

  const { handleSubmit, register } = useForm<{
    chat: string;
  }>({
    defaultValues: { chat: "" }
  });

  const onSubmit = handleSubmit(data => {
    const newMessages: Message[] = [
      ...messages,
      {
        message: data.chat,
        email: "",
        time: new Date(),
        loading: true,
        avatar: "",
        name: ""
      }
    ];
    setMessages(newMessages);
    formRef?.current?.reset();
    socket?.emit("send_message", data.chat);
  });

  const handleScrollView = (scrollTop: number) => {
    const bottomDistance = 90 * (messages.length - 10) - scrollTop;

    if (bottomDistance < 20) {
      setScrollView({ top: true, bottom: false });
      return;
    }
    if (scrollTop === 0) {
      setScrollView({ top: false, bottom: true });
      return;
    }
    setScrollView({ top: true, bottom: true });
  };

  useEffect(() => {
    socket?.on("receive_message", (data: Message[]) => {
      const receiveMessages: Message[] = data.map((item: Message) => ({
        ...item,
        loading: false
      }));
      setMessages(receiveMessages);
    });
  }, [socket]);

  useEffect(() => {
    const fetchGlobalChat = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${URL}/chat`, {
          method: "GET",
          headers: {
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${
              sessionStorage.getItem("Authentication") || ""
            }`
          }
        });
        const data = await response.json();

        const receiveMessages: Message[] = data.map((item: Message) => ({
          ...item,
          loading: false
        }));

        setLoading(false);
        setMessages(receiveMessages);
      } catch (error) {}
    };
    fetchGlobalChat();
  }, [URL]);

  useEffect(() => {
    bottomChatRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start"
    });
  }, [messages]);

  return (
    <Box
      maxW="container.md"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      minW="container.sm"
      position="relative"
    >
      <p className={styles.description}>Global chat room</p>
      {scrollView.top && (
        <ThemedIconButton
          onClick={() =>
            topChatRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "start"
            })
          }
          top="10%"
          left="45%"
          position="absolute"
          aria-label="Scroll to top"
          icon={<ChevronUpIcon />}
          className={styles.card}
        />
      )}
      {scrollView.bottom && (
        <ThemedIconButton
          onClick={() =>
            bottomChatRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "start"
            })
          }
          bottom="13%"
          left="45%"
          position="absolute"
          aria-label="Scroll to bottom"
          icon={<ChevronDownIcon />}
          className={styles.card}
        />
      )}
      {!loading ? (
        <div
          onScroll={e => {
            const { scrollTop } = e.target as HTMLDivElement;
            handleScrollView(scrollTop);
          }}
          className={styles.messages}
        >
          <div ref={topChatRef} />
          {messages.map((message, index) => (
            <Box my={8} key={index}>
              <Flex justifyContent="space-between">
                <Flex width="70%">
                  {message.loading && <Spinner />}
                  <Tooltip label={message.name} placement="left">
                    <Avatar
                      mr={3}
                      mt={1}
                      size="md"
                      name={message.name}
                      src={message.avatar}
                    />
                  </Tooltip>
                  <Box>
                    <Text fontWeight="700">
                      {message.email.substring(0, message.email.indexOf("@"))}
                    </Text>
                    <Text fontSize={20}>{message.message}</Text>
                  </Box>
                </Flex>
                <div>{moment(message.time).format("HH:mm DD/MM")}</div>
              </Flex>
            </Box>
          ))}
          <div ref={bottomChatRef} />
        </div>
      ) : (
        <Center>
          <Spinner />
        </Center>
      )}

      <form ref={formRef} onSubmit={onSubmit}>
        <Flex>
          <Input
            placeholder="hello"
            className={styles.card}
            {...register("chat", { required: true })}
          />
          <ThemedButton label="Send" type="submit" className={styles.card} />
        </Flex>
      </form>
    </Box>
  );
};

export default ChatRoom;
