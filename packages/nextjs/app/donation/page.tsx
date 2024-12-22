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
  const [selectedDonationId, setSelectedDonationId] = useState<number | null>(null);
  const [donationDetails, setDonationDetails] = useState<{
    description: string;
    recipient: string;
    totalDonations: string;
  } | null>(null);

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

  const { data: donationData, refetch: refetchDonation } = useScaffoldReadContract({
    contractName: "DonationContract",
    functionName: "donations",
    args: selectedDonationId !== null ? [selectedDonationId] : undefined,
    enabled: selectedDonationId !== null,
  });

  const handleFetchDonation = async () => {
    try {
      if (selectedDonationId === null) {
        console.error("Donation ID is required!");
        return;
      }
      console.log("Fetching donation details for ID:", selectedDonationId);
  
      const data = await refetchDonation();
      console.log("Fetched data:", data.data);
  
      if (data) {
        setDonationDetails({
          description: data.data[0] || "No description provided",
          recipient: data.data[1] || "No recipient address",
          totalDonations: formatEther(data.data[2] || "0"),
        });
      } else {
        setDonationDetails(null);
        console.error("No donation data found for the given ID.");
      }
    } catch (e) {
      console.error("Error fetching donation details:", e);
    }
  };
  

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

  const handleDonate = async () => {
    try {
      if (donationId === null || !amount) {
        console.error("Donation ID and amount are required!");
        return;
      }
  
      console.log("Sending tokens to DonationContract...");
      await writeTokenAsync({
        functionName: "transfer",
        args: ["0x4A679253410272dd5232B3Ff7cF5dbB88f295319", parseEther(amount)],
      });
  
      console.log("Tokens sent successfully. Updating donation...");
      await writeDonationAsync({
        functionName: "donate",
        args: [donationId, parseEther(amount)],
      });
  
      console.log("Donation updated successfully!");
      setDonationId(null);
      setAmount("");
    } catch (e) {
      console.error("Error donating tokens:", e);
    }
  };
  

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 text-center max-w-4xl">
        <h1 className="text-4xl font-bold">Donation System vol. 1</h1>
        <p>Создавайте пожертвования и делитесь токенами</p>
        <div className="divider my-0" />
      </div>

      <div className="flex flex-col justify-center items-center bg-base-300 w-full mt-8 px-8 pt-6 pb-12">
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
          <p className="my-2 mr-2 font-bold text-2xl">Баланс:</p>
          <p className="text-xl">{balance ? formatEther(balance) : 0} tokens</p>
        </div>

        <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center w-full md:w-2/4 rounded-3xl mt-10">
          <h3 className="text-2xl font-bold">Создать пожертвование</h3>
          <div className="flex flex-col items-center justify-between w-full lg:w-3/5 px-2 mt-4">
            <div className="font-bold mb-2">Описание:</div>
            <InputBase value={description} onChange={setDescription} placeholder="Введите описание" />
          </div>
          <div className="flex flex-col items-center justify-between w-full lg:w-3/5 p-2 mt-4">
            <div className="font-bold mb-2">Адрес получателя:</div>
            <AddressInput value={recipient} onChange={setRecipient} placeholder="Введите адрес получателя" />
          </div>
          <button
            className="btn btn-primary text-lg px-12 mt-2"
            disabled={!description || !recipient}
            onClick={handleCreateDonation}
          >
            Create Donation
          </button>
        </div>

        <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center w-full md:w-2/4 rounded-3xl mt-10">
          <h3 className="text-2xl font-bold">Пожертвовать</h3>
          <div className="flex flex-col items-center justify-between w-full lg:w-3/5 px-2 mt-4">
            <div className="font-bold mb-2">ID пожертвования:</div>
            <InputBase
              value={donationId !== null ? donationId.toString() : ""}
              onChange={(value) => setDonationId(Number(value))}
              placeholder="Введите ID пожертвования"
            />
          </div>
          <div className="flex flex-col items-center justify-between w-full lg:w-3/5 p-2 mt-4">
            <div className="font-bold mb-2">Количество токенов:</div>
            <InputBase value={amount} onChange={setAmount} placeholder="Введите количество токенов" />
          </div>
          <button
            className="btn btn-primary text-lg px-12 mt-2"
            disabled={!donationId || !amount}
            onClick={handleDonate}
          >
            Пожертвовать!
          </button>
        </div>

        <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center w-full md:w-2/4 rounded-3xl mt-10">
          <h3 className="text-2xl font-bold">Посмотреть данные о сборе</h3>
          <div className="flex flex-col items-center justify-between w-full lg:w-3/5 px-2 mt-4">
            <div className="font-bold mb-2">ID сбора:</div>
            <InputBase
              value={selectedDonationId !== null ? selectedDonationId.toString() : ""}
              onChange={(value) => setSelectedDonationId(Number(value))}
              placeholder="Введите ID сбора"
            />
          </div>
          <button
            className="btn btn-secondary text-lg px-12 mt-2"
            disabled={selectedDonationId === null}
            onClick={handleFetchDonation}
          >
            Посмотреть информацию
          </button>

          {donationDetails && (
            <div className="mt-6">
              <p><strong>Description:</strong> {donationDetails.description}</p>
              <p><strong>Recipient:</strong> {donationDetails.recipient}</p>
              <p><strong>Total Donations:</strong> {donationDetails.totalDonations} tokens</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Donations;
