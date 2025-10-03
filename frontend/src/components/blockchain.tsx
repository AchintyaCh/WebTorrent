import React, { useState } from "react";
import getContract from "../contract";
import type { Signer } from "ethers";
import "./Blockchain.css";

// @ts-ignore
const client = new window.WebTorrent();

type BrowserTorrent = {
  infoHash: string;
  files: {
    name: string;
    getBlobURL: (cb: (err: any, url?: string) => void) => void;
  }[];
  progress: number;
  on: (event: string, cb: () => void) => void;
};

const Blockchain: React.FC = () => {
  const [account, setAccount] = useState("");
  const [connected, setConnected] = useState(false);
  const [files, setFiles] = useState<
    {
      id: number;
      title: string;
      description: string;
      price: string;
      seller: string;
      infoHash: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const connectWallet = async () => {
    try {
      const c = await getContract(true);
      const signer = c.runner as Signer;
      const addr = await signer.getAddress();
      setAccount(addr);
      setConnected(true);
      setErrorMessage("");
      loadFiles();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to connect wallet");
    }
  };

  const loadFiles = async () => {
    try {
      const c = await getContract(false);
      const provider = c.runner?.provider;
      if (!provider) throw new Error("Provider is not available.");

      const code = await provider.getCode(c.target);
      if (code === "0x") throw new Error("Contract not deployed.");

      const count = await c.fileCount();
      const filesList: any[] = [];
      const numFiles = Number(count);

      for (let i = 1; i <= numFiles; i++) {
        const f = await c.files(i);
        const hex = f.encryptedPeerInfo;
        if (!hex || hex === "0x") {
          console.warn(`Skipping file ${i}: empty peer info`);
          continue;
        }

        const uint8 = new Uint8Array(
          hex
            .slice(2)
            .match(/.{1,2}/g)!
            .map((byte: string) => parseInt(byte, 16))
        );

        const decoded = new TextDecoder().decode(uint8);
        if (!decoded || decoded.trim() === "") {
          console.warn(`Skipping file ${i}: corrupted peer info`);
          continue;
        }

        let parsed;
        try {
          parsed = JSON.parse(decoded);
        } catch (err) {
          console.warn(`Skipping file ${i}: failed to parse JSON`);
          continue;
        }

        filesList.push({
          id: i,
          title: f.title,
          description: f.description,
          price: f.price.toString(),
          seller: f.seller,
          infoHash: parsed.infoHash,
        });
      }
      setFiles(filesList);
    } catch (error: any) {
      console.error("Error loading files:", error);
      setErrorMessage(error.message || "Failed to load files");
    }
  };

  const listFile = async () => {
    if (!uploadFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      await new Promise<void>((resolve, reject) => {
        client.seed(
          uploadFile,
          { announce: [], dht: true } as any,
          async (torrent: BrowserTorrent) => {
            try {
              const peerInfo = {
                infoHash: torrent.infoHash,
                name: uploadFile.name,
                size: uploadFile.size,
              };

              const encoded = new TextEncoder().encode(
                JSON.stringify(peerInfo)
              );
              const c = await getContract(false);
              const tx = await c.listFile(title, description, price, encoded);
              await tx.wait();

              alert("File listed successfully!");
              setTitle("");
              setDescription("");
              setPrice("");
              setUploadFile(null);
              loadFiles();
              resolve();
            } catch (err: any) {
              console.error("Error during seeding/listing:", err);
              setErrorMessage(err.message || "File listing failed");
              reject(err);
            }
          }
        );
      });
    } finally {
      setLoading(false);
    }
  };

  const purchaseFile = async (id: number, price: string, infoHash: string) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const c = await getContract(false);
      const tx = await c.purchaseFile(id, { value: price });
      await tx.wait();

      alert("Purchase successful! Connecting to peer...");

      client.add(
        infoHash,
        { announce: [], dht: true } as any,
        (torrent: BrowserTorrent) => {
          torrent.files[0].getBlobURL((err, url) => {
            if (err || typeof url !== "string") {
              setErrorMessage("Failed to download file.");
              return;
            }
            const a = document.createElement("a");
            a.href = url;
            a.download = torrent.files[0].name ?? "downloaded-file";
            a.click();
          });
        }
      );
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blockchain-container">
      <h1>Decentralized P2P File Marketplace</h1>

      {!connected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected Account: {account}</p>
      )}

      {errorMessage && <p className="error">{errorMessage}</p>}

      {connected && (
        <div className="upload-form">
          <h2>List a New File</h2>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price (wei)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            type="file"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          />
          <button onClick={listFile} disabled={loading}>
            {loading ? "Seeding..." : "List File"}
          </button>
        </div>
      )}

      <div className="files-grid">
        {files.map((file) => (
          <div key={file.id} className="file-card">
            <h3>{file.title}</h3>
            <p>{file.description}</p>
            <p>
              <strong>Price:</strong> {file.price} wei
            </p>
            <p>
              <strong>Seller:</strong> {file.seller}
            </p>
            <button
              onClick={() => purchaseFile(file.id, file.price, file.infoHash)}
              disabled={loading}
            >
              {loading ? "Processing..." : "Purchase & Download"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blockchain;
