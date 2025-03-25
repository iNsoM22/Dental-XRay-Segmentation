import { toast } from "sonner";

export const toastError = (text: string) => {
  return toast.error(<div className="text-xl">{text}</div>, {
    style: {
      width: "600px",
      marginBottom: "40px",
    },
  });
};
