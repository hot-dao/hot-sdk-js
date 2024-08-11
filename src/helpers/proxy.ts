import sha1 from "sha1";
import uuid4 from "uuid4";
import { baseEncode } from "@near-js/utils";

export const proxyApi = "https://h4n.app";

export const getResponse = async (id: string): Promise<object> => {
  const res = await fetch(`${proxyApi}/${id}/response`, {
    headers: { "content-type": "application/json" },
    method: "GET",
  });

  if (res.ok === false) {
    throw Error(await res.text());
  }

  const { data } = await res.json();
  return JSON.parse(data);
};

export const deleteRequest = async (id: string) => {
  const res = await fetch(`${proxyApi}/${id}`, {
    headers: { "content-type": "application/json" },
    method: "DELETE",
  });

  if (res.ok === false) {
    throw Error(await res.text());
  }
};

export const computeRequestId = async (request: object) => {
  const query = baseEncode(JSON.stringify({ ...request, _id: uuid4() }));
  const hashsum = sha1(query);
  const id = Buffer.from(hashsum, "hex").toString("base64");
  const requestId = id.replaceAll("/", "_").replaceAll("-", "+").slice(0, 13);
  return { requestId, query };
};

export const createRequest = async (request: object, signal?: AbortSignal) => {
  const { query, requestId } = await computeRequestId(request);
  const res = await fetch(`${proxyApi}/${requestId}/request`, {
    body: JSON.stringify({ data: query }),
    headers: { "content-type": "application/json" },
    method: "POST",
    signal,
  });

  if (res.ok === false) {
    throw Error(await res.text());
  }

  return requestId;
};
