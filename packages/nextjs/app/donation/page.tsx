"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { AddressInput, InputBase } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Donation: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [donationAmount, setDonationAmount] = useState<string>("");

  const { data: balance } = useScaffoldReadContract({
    contractName: "SE2Token",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "SE2Token",
    functionName: "totalSupply",
  });

  const { data: donationContractAddress } = useScaffoldReadContract({
    contractName: "DonationContract",
    functionName: "token",
  });

  const { writeContractAsync: donateAsync } = useScaffoldWriteContract("DonationContract");

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 text-center max-w-4xl">
          <h1 className="text-4xl font-bold">SE2Token Donation System</h1>
          <div>
            <p>
              Эта страница позволяет вам делать пожертвования SE2 токенами другим адресам. Вы можете выбрать адрес получателя и количество токенов для пожертвования.
            </p>
          </div>

          <div className="divider my-0" />

          <h2 className="text-3xl font-bold mt-4">Donate SE2 Tokens</h2>

          <div>
            <p>Ваш баланс: {balance ? formatEther(balance) : 0} SE2</p>
            <p>Общий объем токенов: {totalSupply ? formatEther(totalSupply) : 0} SE2</p>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center bg-base-300 w-full mt-8 px-8 pt-6 pb-12">
          <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center w-full md:w-2/4 rounded-3xl mt-10">
            <h3 className="text-2xl font-bold">Make a Donation</h3>
            <div className="flex flex-col items-center justify-between w-full lg:w-3/5 px-2 mt-4">
              <div className="font-bold mb-2">Recipient Address:</div>
              <div>
                <AddressInput value={recipientAddress} onChange={setRecipientAddress} placeholder="0x..." />
              </div>
            </div>
            <div className="flex flex-col items-center justify-between w-full lg:w-3/5 p-2 mt-4">
              <div className="flex gap-2 mb-2">
                <div className="font-bold">Amount:</div>
                <div>
                  <button
                    disabled={!balance}
                    className="btn btn-secondary text-xs h-6 min-h-6"
                    onClick={() => {
                      if (balance) {
                        setDonationAmount(formatEther(balance));
                      }
                    }}
                  >
                    Max
                  </button>
                </div>
              </div>
              <div>
                <InputBase value={donationAmount} onChange={setDonationAmount} placeholder="0" />
              </div>
            </div>
            <div>
              <button
                className="btn btn-primary text-lg px-12 mt-2"
                disabled={!recipientAddress || !donationAmount}
                onClick={async () => {
                  try {
                    if (!donationContractAddress) {
                      console.error("DonationContract address not found");
                      return;
                    }
                    await donateAsync({
                      functionName: "donate",
                      args: [recipientAddress, parseEther(donationAmount)],
                    });
                    setRecipientAddress("");
                    setDonationAmount("");
                  } catch (e) {
                    console.error("Error while donating tokens", e);
                  }
                }}
              >
                Donate
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Donation;
