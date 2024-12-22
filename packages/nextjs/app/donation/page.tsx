"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { parseEther, formatEther } from "viem";
import { useAccount } from "wagmi";
import { AddressInput, InputBase } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Donations: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const [description, setDescription] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [donationId, setDonationId] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");

  // Чтение данных из контрактов
  const { data: balance } = useScaffoldReadContract({
    contractName: "SE2Token",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: totalDonations } = useScaffoldReadContract({
    contractName: "DonationContract",
    functionName: "getDonationsCount",
  });

  const { writeContractAsync: writeDonationAsync } = useScaffoldWriteContract("DonationContract");
  const { writeContractAsync: writeTokenAsync } = useScaffoldWriteContract("SE2Token");

  // Создание кампании
  const handleCreateDonation = async () => {
    try {
      await writeDonationAsync({
        functionName: "createDonation",
        args: [description, recipient],
      });
      console.log("Donation created successfully!");
      setDescription("");
      setRecipient("");
    } catch (e) {
      console.error("Error creating donation:", e);
    }
  };

  // Пожертвование токенов
  const handleDonate = async () => {
    try {
      if (donationId === null || !amount) {
        console.error("Donation ID and amount are required!");
        return;
      }

      // Отправка токенов в контракт DonationContract
      await writeTokenAsync({
        functionName: "transfer",
        args: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", parseEther(amount)], // Адрес DonationContract
      });

      console.log("Tokens donated successfully!");
      setDonationId(null);
      setAmount("");
    } catch (e) {
      console.error("Error donating tokens:", e);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 text-center max-w-4xl">
        <h1 className="text-4xl font-bold">Donation System</h1>
        <p>Create donation campaigns and donate tokens directly!</p>
        <div className="divider my-0" />
      </div>

      <div className="flex flex-col justify-center items-center bg-base-300 w-full mt-8 px-8 pt-6 pb-12">
        {/* Balance */}
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
          <p className="my-2 mr-2 font-bold text-2xl">Your Balance:</p>
          <p className="text-xl">{balance ? formatEther(balance) : 0} tokens</p>
        </div>

        {/* Create Donation */}
        <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center w-full md:w-2/4 rounded-3xl mt-10">
          <h3 className="text-2xl font-bold">Create Donation</h3>
          <div className="flex flex-col items-center justify-between w-full lg:w-3/5 px-2 mt-4">
            <div className="font-bold mb-2">Description:</div>
            <InputBase value={description} onChange={setDescription} placeholder="Enter description" />
          </div>
          <div className="flex flex-col items-center justify-between w-full lg:w-3/5 p-2 mt-4">
            <div className="font-bold mb-2">Recipient Address:</div>
            <AddressInput value={recipient} onChange={setRecipient} placeholder="Enter recipient address" />
          </div>
          <button
            className="btn btn-primary text-lg px-12 mt-2"
            disabled={!description || !recipient}
            onClick={handleCreateDonation}
          >
            Create Donation
          </button>
        </div>

        {/* Donate */}
        <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center w-full md:w-2/4 rounded-3xl mt-10">
          <h3 className="text-2xl font-bold">Donate</h3>
          <div className="flex flex-col items-center justify-between w-full lg:w-3/5 px-2 mt-4">
            <div className="font-bold mb-2">Donation ID:</div>
            <InputBase
              value={donationId !== null ? donationId.toString() : ""}
              onChange={(value) => setDonationId(Number(value))}
              placeholder="Enter donation ID"
            />
          </div>
          <div className="flex flex-col items-center justify-between w-full lg:w-3/5 p-2 mt-4">
            <div className="font-bold mb-2">Amount:</div>
            <InputBase value={amount} onChange={setAmount} placeholder="Enter amount to donate" />
          </div>
          <button
            className="btn btn-primary text-lg px-12 mt-2"
            disabled={!donationId || !amount}
            onClick={handleDonate}
          >
            Donate Tokens
          </button>
        </div>
      </div>
    </div>
  );
};

export default Donations;
