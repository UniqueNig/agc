type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    customer?: {
      email?: string;
    };
  };
};

function getPaystackSecretKey() {
  const secretKey =
    process.env.PAYSTACK_SECRET_KEY ?? process.env.PAYSTACK_SECRET;

  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }

  return secretKey;
}

export const initializePayment = async (email: string, amount: number) => {
  const secretKey = getPaystackSecretKey();

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

export const verifyPayment = async (reference: string) => {
  const secretKey = getPaystackSecretKey();

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const data = (await response.json()) as PaystackVerifyResponse;

  if (!response.ok || !data.status || !data.data?.reference) {
    throw new Error(data.message || "Failed to verify Paystack payment.");
  }

  return data;
};
