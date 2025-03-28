import { toast } from "sonner";

export const toastError = (text: string) => {
  return toast.error(<div className="text-wrap text-sm">{text}</div>, {
    style: {
      width: "350px",
      marginBottom: "40px",
    },
  });
};

export const toastInfo = (text: string) => {
  return toast.info(<div className="text-wrap text-sm">{text}</div>, {
    style: {
      width: "350px",
      marginBottom: "40px",
      textWrap: "wrap",
    },
  });
};
