export default function DeploymentStatus({ status, tokenData }) {
  if (status === "idle") {
    return null;
  }

  if (status === "pending") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <h3 className="text-lg font-medium text-yellow-800">Deploying Token</h3>
        <p className="text-yellow-700">
          Please wait and confirm the transaction in your wallet...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Deployment Failed</h3>
        <p className="text-red-700">{tokenData}</p>
        <p className="text-sm text-red-600 mt-2">
          Please try again or check your wallet settings.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-md">
        <h3 className="text-lg font-medium text-green-800">
          Token Deployed Successfully!
        </h3>
        <div className="mt-3 space-y-2">
          <p className="text-gray-700">
            <span className="font-semibold">Name:</span> {tokenData.name}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Symbol:</span> {tokenData.symbol}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Total Supply:</span>{" "}
            {tokenData.supply} {tokenData.symbol}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Decimals:</span>{" "}
            {tokenData.decimals}
          </p>
          <p className="text-gray-700 break-all">
            <span className="font-semibold">Contract Address:</span>{" "}
            {tokenData.address}
          </p>
          <div className="pt-2">
            <a
              href={`https://sepolia.arbiscan.io/address/${tokenData.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View on Arbiscan
            </a>
            <span className="mx-2">|</span>
            <a
              href={`https://sepolia.arbiscan.io/tx/${tokenData.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Transaction
            </a>
          </div>
        </div>
      </div>
    );
  }
}
