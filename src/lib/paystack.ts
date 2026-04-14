type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export const initializePayment = async (email: string, amount: number) => {
  const secretKey =
    process.env.PAYSTACK_SECRET_KEY ?? process.env.PAYSTACK_SECRET;

  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }

  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/vote/success`,
      }),
    }
  );

  const data = (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !data.status || !data.data?.reference) {
    throw new Error(data.message || "Failed to initialize Paystack payment.");
  }

  return data;
};
