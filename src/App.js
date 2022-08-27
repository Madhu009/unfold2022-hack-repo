import logo from "./logo.svg";
import "./App.css";
import React from "react";
import ImageUploading from "react-images-uploading";
import AWS from "aws-sdk";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactRoundedImage from "react-rounded-image";

import { Upload } from "@aws-sdk/lib-storage";
import { S3Client, S3 } from "@aws-sdk/client-s3";

import "./App.css";
import groupPhoto from "./assets/header.png";
import Select from "react-select";
import animatedGif from "./assets/upload.png";

import "react-vertical-timeline-component/style.min.css";

import Web3 from "web3";
import Contract from "./UHC.json";

const priceMints = [
  { label: 1, value: 1 },
  { label: 2, value: 2 },
  { label: 3, value: 3 },
  { label: 4, value: 4 },
  { label: 5, value: 5 },
  { label: 6, value: 6 },
  { label: 7, value: 7 },
  { label: 8, value: 8 },
  { label: 9, value: 9 },
  { label: 10, value: 10 },
];

function App() {
  const maxNumber = 169;
  const [file, setFile] = useState();

  const [show, setShow] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  const [walletAddress, setWallet] = useState("");
  const [currentSupply, setcurrentSupply] = useState(0);
  const [status, setStatus] = useState("");
  const [showMetaError, setShowMetaError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [valueIncrese, setValueIncrese] = useState(4000);
  const [quantity, setQuantity] = useState(1);
  const [gasLimit, setGasLimit] = useState(131975);
  const [gasPrice, setGasPrice] = useState(131975);

  const contract_address = "0xFbD664fc889f41e3F5065d76a855d92A25Efa3fC";
  const [image, setImage] = React.useState();

  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const uploadJSON = (file) => {
    var file = file.target.files[0];

    var fileExt = file.name.split(".")[1];
    setFile(URL.createObjectURL(file));

    if (fileExt != 'jpg'){
      alert ("Only .jpg allowed at this time");
      return;
    }

    var currentToken = parseInt(currentSupply) +1;

    var metadata = {
      name: currentToken.toString(),
      image:
        "https://unfold2022hackers.club/metadata/assets/" +
        currentToken.toString() +
        ".jpg",
    };

    const target = {
      Bucket: "unfold2022-website",
      Key: "metadata/" + currentToken.toString() + ".json",
      Body: JSON.stringify(metadata),
      ContentType: "application/json",
    };

    
    const creds = {
      accessKeyId: "AKIARP2IDETI4LFGDIWH",
      secretAccessKey: "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",
      region: "ap-south-1",
    };

    try {
      const parallelUploads3 = new Upload({
        client: new S3Client({ region: "ap-south-1", credentials: creds }),
        params: target,
      });

      parallelUploads3.on("httpUploadProgress", (progress) => {
        console.log(progress);
      });
      parallelUploads3.done();
    } catch (e) {
      console.log(e);
    }

    // upload image
    const target1 = { Bucket: "unfold2022-website", Key: "metadata/assets/"+currentToken.toString()+".jpg", Body: file };

    try {
      const parallelUploads3 = new Upload({
        client: new S3Client({ region: "ap-south-1", credentials: creds }),
        params: target1,
      });

      parallelUploads3.on("httpUploadProgress", (progress) => {
        console.log(progress);
      });
      parallelUploads3.done();
    } catch (e) {
      console.log(e);
    }

  };

  const getTotalSupply = async () => {
    const totalSupply = await contract.methods.totalSupply().call();
    return totalSupply;
  };
  var web3;
  var contract = null;
  let foo = null;

  if (typeof window !== "undefined") {
    foo = window.localStorage.getItem("foo");
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(Contract, contract_address);
  }

  const setSupply = async () => {
    const supply = await getTotalSupply();
    setcurrentSupply(supply);
  };

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();

    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (addressArray.length > 0) {
          return {
            address: addressArray[0],
            status: "",
          };
        } else {
          return {
            address: "",
            status: "There is some error connecting the wallet, try again",
          };
        }
      } catch (err) {
        return {
          address: "",
          status: "There is some error connecting the wallet, try again",
        };
      }
    } else {
      return {
        address: "",
        status: (
          <span>
            <p>
              {" "}
              🦊{" "}
              <a target="_blank" href={`https://metamask.io/download.html`}>
                You must install Metamask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          </span>
        ),
      };
    }
  };

  const addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });

      window.ethereum.on("networkChanged", (networkId) => {
        console.log("networkChanged ", networkId);
        // alert(networkId);
      });

      window.ethereum.on("chainChanged", (chainId) => {
        if (chainId == 137) {
          setStatus("");
        } else {
          alert("Change network to Matic Mainnet");
        }
        // window.location.reload();
      });
    } else {
      setWallet("");
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  };

  const mint = async () => {
    if (!walletAddress) {
      setStatus("Please connect the wallet");
      return;
    }
    if (!file) {
      alert("No image is uploaded");
      return;
    }

    const networkId = await window.ethereum.request({
      method: "net_version",
    });

    if (networkId != 137) {
      alert("Change network to Matic Mainnet");
      return;
    }

    setIsLoading(true);

    var cost = 0;

    const mint = await contract.methods
      .Mint()
      .send({
        gasLimit: web3.utils.toWei(gasLimit.toString(), "wei"),
        gas: web3.utils.toWei(gasPrice.toString(), "wei"),
        to: contract_address,
        from: walletAddress,
        value: web3.utils.toWei(cost.toString(), "ether"),
      })
      .on("transactionHash", function (hash) {
        var url = "https://polygonscan.com/tx/" + hash;

        setShowMetaError(
          <a href={url} target="_blank">
            Transaction pending on polygonscan{" "}
          </a>
        );
      })
      .once("error", (err) => {
        console.log(err.code);

        const code = err.code;
        if (code == 4001) {
          setIsLoading(false);
          setShowMetaError("Transaction was rejected!");
        } else {
          setIsLoading(false);
          setShowMetaError("Something went wrong, Try again!");
        }

        return err;
      })
      .then((receipt) => {
        setIsLoading(false);
        return receipt;
      });

    setIsLoading(false);
  };

  const getInputDropdown = () => {
    return priceMints;
  };
  useEffect(async () => {
    const { address, status } = await connectWallet();
    setWallet(address);
    setStatus(status);

    setSupply();

    addWalletListener();
  }, []);

  function handleChange(e) {
    console.log(e.target.files);
    setFile(URL.createObjectURL(e.target.files[0]));
  }

  const onFileUpload = () => {
    const formData = new FormData();

    formData.append("myFile", file, currentSupply + 1);

    // axios.post("api/uploadfile", formData);
  };

  const onChange = (imageList, addUpdateIndex) => {
    setImage(imageList);
  };

  return (
    <div className="App">
      <div>
        <img
          src={groupPhoto}
          style={{
            width: "100%",
            height: "100%",
            resizeMode: "contain",
          }}
        />
      </div>

      <div
        className="App-header"
        style={{ display: "flex", flexDirection: "row" }}
      >
        <div style={{ width: "40%" }}>
          {file == null ? (
            <img
              // onClick={(event) => {
              //   alert("clicked");
              //   // setSelectedFile(event.target.files[0]);
              // }}
              src={animatedGif}
              alt="loading..."
              style={{
                border: "3px solid",
                borderColor: "white",
                borderRadius: 40,
                height: 400,
                width: 400,
              }}
            />
          ) : (
            <img
              // onClick={(event) => {
              //   alert("clivked");
              //   // setSelectedFile(event.target.files[0]);
              // }}
              src={file}
              alt="loading..."
              style={{
                border: "3px solid",
                borderColor: "white",
                borderRadius: 40,
                height: 400,
                width: 400,
              }}
            />
          )}

          <input type="file" onChange={uploadJSON} />
        </div>

        <div style={{ width: "60%" }}>
          <p style={{ fontFamily: "rs" }}>
            A community of 1000 Web3 Hackers met at the unfold2022 hackathon
            building super dope shizzz in web3.
            <br></br>
          </p>

          <p style={{ fontFamily: "rs", fontSize: 21 }}>
            Current Supply : {currentSupply}/1000
          </p>
          <p style={{ fontFamily: "rs", fontSize: 18 }}>
            1 Free Mint per wallet <br></br>
          </p>
          <br></br>
          

          <br></br>

          <ToastContainer style={{ fontFamily: "rs" }} position="top-left" />

          {walletAddress ? (
            <>
              <button
                style={{
                  alignItems: "center",
                  width: "250px",
                  borderRadius: "96px",
                  height: "85px",
                  backgroundSize: "100%",
                  justifyContent: "center",
                  margin: 10,
                }}
                onClick={() => mint()}
              >
                {" "}
                <p style={{ fontFamily: "rs", fontSize: 15 }}>Mint</p>
              </button>
              <p style={{ fontFamily: "rs", fontSize: 15 }}>
                Connected : {walletAddress}{" "}
              </p>
              <p style={{ fontFamily: "rs", fontSize: 15 }}>{showMetaError}</p>
            </>
          ) : (
            <button
              style={{
                alignItems: "center",
                width: "250px",
                borderRadius: "96px",
                height: "85px",
                backgroundSize: "100%",
                justifyContent: "center",
                margin: 10,
              }}
              onClick={() => connectWalletPressed()}
            >
              {" "}
              <p style={{ fontFamily: "rs", fontSize: 15 }}>Connect Wallet</p>
            </button>
          )}
        </div>
      </div>

      <div></div>
    </div>
  );
}

export default App;
