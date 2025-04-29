import { getStore } from "@netlify/blobs";

export async function handler(event, context) {
  const store = getStore("my-store-name");

  // 데이터 저장하기
  await store.set("my-key", "Hello World");

  // 데이터 가져오기
  const value = await store.get("my-key");

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Data saved!", value: value }),
  };
}
