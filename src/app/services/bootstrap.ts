"use server";

export const initiateBootstraping = async (targetindex: string) => {
  const BaseURL = process.env.PRODUCTION_URL
    ? `https://${process.env.PRODUCTION_URL}`
    : `http://localhost:${process.env.PORT}`;

    const responce = await fetch(`${BaseURL}/api/ingest`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetindex }),
    });
    if (!responce.ok){
        throw new Error(`API request failed with status ${responce.status}`);
    }
};
