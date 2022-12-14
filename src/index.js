import { ethers } from 'ethers';

const homepage = window.location.href.split('://').pop().split('.limo')[0];

const profileElm = document.getElementById('profile');
const noProfileElm = document.getElementById('noProfile');
const welcomeElm = document.getElementById('welcome');

const ensLoaderElm = document.getElementById('ensLoader');
const ensContainerElm = document.getElementById('ensContainer');
const ensTableElm = document.getElementById('ensTable');

const ensAddress = "https://api.thegraph.com/subgraphs/name/ensdomains/ens";
const tablePrefix = ``;

const alchemyKeyMainnet = `1neXhbbd8evjTkGGVh3cLByBqFjVPf8F`;
const provider = new ethers.providers.AlchemyProvider("mainnet", alchemyKeyMainnet);

let widthScreen = screen.width;
let tr = '';
if (widthScreen <= 400) {
  tr = 'trmobile';
} else {
  tr = 'trdesktop';
}

async function getENSMetadata(ensName) {
    const body = JSON.stringify({
        query: `{
          domains(where:{ name: "${ensName}" })
            {
              name
              owner
                {
                  id
                }
              parent
                {
                  name
                }
              resolver
                {
                  texts
                  contentHash
                }
              createdAt
              resolvedAddress
                {
                  id
                }
              events
                {
                  transactionID
                }
            }
          registrations(where:{ labelName: "${ensName.split(".").at(-2)}" })
            {
              registrationDate
              expiryDate
              labelName
              events
                {
                  transactionID
                }
            }
          }`
    });

    let res = await fetch(ensAddress, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body
    });

    let nextProfile = '';
    const resolver = await provider.getResolver(ensName);
    const wrapper = await res.json();
    const {data} = wrapper;
    const {domains, registrations} = data;

    let blockNumber = 0;
    let resolvedAddress = '';
    let textKeys = [];
    let createdAt = 0;
    let registrationDate = 0;
    let expiryDate = 0;
    let ttl = '';
    let parent = '';
    let owner = '';
    let transactionID = '';
    let contract = 'none';
    let tokenID = 'none';
    let balance = 0;
    if (domains.length > 0) {
      if (resolver) {
        for (let i = 0, x = domains.length; i < x; i++) {
            let domain = domains[i];
            let registration = registrations[i];
            if (domain.name === ensName && registration.labelName === ensName.split(".").at(-2)) {
                textKeys = domain.resolver.texts;
                resolvedAddress = domain.resolvedAddress ? domain.resolvedAddress.id : '';
                createdAt = domain.createdAt;
                ttl = domain.ttl;
                owner = domain.owner.id;
                transactionID = domain.events[0].transactionID;
                blockNumber = (await provider.getTransaction(transactionID)).blockNumber;
                registrationDate = (await provider.getBlock(blockNumber)).timestamp;
                expiryDate = 32503680000; // January 1, 3000 00:00:00 UTC
                break;
            }
        }
        nextProfile = `<tr><td><div class="tooltip">???? member<span class="tooltiptext">bensyc subdomain</span></div></td><td><span class="${tr}"><a href="https://alpha.ens.domains/profile/${ensName}" target="_blank">${ensName} ???</a></span></td></tr>`;

        nextProfile += `<tr><td><div class="tooltip">???? owner<span class="tooltiptext">minter of subdomain</span></div></td><td><span class="${tr}"><a href="https://etherscan.io/address/${owner}" target="_blank">${owner.slice(0,6)}...${owner.slice(-4)} ???</a></span></td></tr>`

        if (resolvedAddress) {
          nextProfile += `<tr><td><div class="tooltip">?????? address<span class="tooltiptext">resolved address of subdomain</span></div></td><td><span class="${tr}"><a href="https://etherscan.io/address/${resolvedAddress}" target="_blank">${resolvedAddress.slice(0,6)}...${resolvedAddress.slice(-4)} ???</a></span></td></tr>`
        } else {
          if (widthScreen <= 400) {
            nextProfile += `<tr><td><div class="tooltip">?????? address<span class="tooltiptext">resolved address of subdomain</span></div></td><td><span class="${tr}">?????? no address ??????</span></td></tr>`
          } else {
            nextProfile += `<tr><td><div class="tooltip">?????? address<span class="tooltiptext">resolved address of subdomain</span></div></td><td><span class="${tr}">?????? no address found ??????</span></td></tr>`
          }
        }

        nextProfile += `<tr><td><div class="tooltip">??????? minted<span class="tooltiptext">date & time of mint</span></div></td><td><span class="${tr}">${new Date(registrationDate*1000).toLocaleString("en-US",{hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})} UTC</span></td></tr>`

        nextProfile += `<tr><td><div class="tooltip">??? expires<span class="tooltiptext">date & time of expiry</span></div></td><td><span class="${tr}">${new Date(expiryDate*1000).toLocaleString("en-US",{hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})} UTC</span></td></tr>`

        nextProfile += `<tr><td><div class="tooltip">?????? txn id<span class="tooltiptext">mint transaction hash</span></div></td><td><span class="${tr}"><a href="https://etherscan.io/tx/${transactionID}" target="_blank">${transactionID.slice(0,6)}...${transactionID.slice(-4)} ???</a></span></td></tr>`

        nextProfile += `<tr><td><div class="tooltip">???? opensea<span class="tooltiptext">link to nft on opensea</span></div></td><td><span class="${tr}"><a href="https://opensea.io/assets/ethereum/${contract}/${tokenID}" target="_blank">Link ???</a></span></td></tr>`

        nextProfile += `<tr><td><div class="tooltip">$<img class="icon" src="https://ipfs.io/ipfs/QmREy1wn2i2NBAmDWRFNBGXWEF5Skc6gP7J8UBHh3ZdBXg?filename=ape.png"> balance<span class="tooltiptext">your balance of $<img class="tiny" src="https://ipfs.io/ipfs/QmREy1wn2i2NBAmDWRFNBGXWEF5Skc6gP7J8UBHh3ZdBXg?filename=ape.png"> token</span></div></td><td><span class="${tr}">${balance}</span></td></tr>`

        nextProfile += `<tr><td><div class="tooltip">$???? balance<span class="tooltiptext">your balance of $???? token</span></div></td><td><span class="${tr}">${balance}</span></td></tr>`
      } else {
        nextProfile = `<tr><td><div class="tooltip">???? member<span class="tooltiptext">bensyc subdomain</span></div></td><td><span class="${tr}"><a href="https://alpha.ens.domains/profile/${ensName}" target="_blank">${ensName} ???</a></span></td></tr>`;
        if (widthScreen <= 400) {
          nextProfile += `<tr><td><div class="tooltip" style="color: indianred;">??? warning:<span class="tooltiptext">resolver status</span></div></td><td><span class="${tr}">?????? no resolver ??????</span></td></tr>`
        } else {
          nextProfile += `<tr><td><div class="tooltip" style="color: indianred;">??? warning:<span class="tooltiptext">resolver status</span></div></td><td><span class="${tr}">?????? no resolver set ??????</span></td></tr>`
        }
      }
    } else {
      nextProfile = `<tr><td><div class="tooltip">???? member<span class="tooltiptext">bensyc subdomain</span></div></td><td><span class="${tr}" style="color: red;">??? ${homepage.slice(0,-22)}.bensyc.eth</span></td></tr>`;
    }

    return tablePrefix + nextProfile
}

async function displayENSProfile(homepage) {
    const ensName = homepage;

    if (ensName) {
        profileElm.classList = '';
        ensLoaderElm.innerHTML = `<br></br><br></br><br></br><br></br><br></br><br></br><br></br> <span style="font-size: 22px;">Loading ...</span>`;
        // welcomeElm.innerHTML = `Hello, <span style="font-family: 'SFMono'; font-weight: 600; font-size: 20px;">${ensName.slice(0,-11)}</span>${ensName.slice(-11)}`;
        welcomeElm.innerHTML = '';
        let avatar = await provider.getAvatar(ensName);
        if (avatar) {
            welcomeElm.innerHTML += `<br></br><br></br><br></br><br></br><br></br> <img type="image" class="avatar" src=${avatar}>`;
        } else {
            welcomeElm.innerHTML += `<br></br><br></br><br></br><br></br><br></br> <img type="image" class="avatar" src="https://ipfs.io/ipfs/QmSUh9e9mFSoNd5dZ1XmZsYgDaAn3uamxCbhr38ZFq3L6u?filename=bensyc.png">`;
        }

        ensTableElm.innerHTML = await getENSMetadata(ensName);
        ensLoaderElm.innerHTML = '';
        ensContainerElm.classList = '';
    } else {
        welcomeElm.innerHTML = `Hello, Stranger`;
        noProfileElm.classList = ``;
    }

    welcomeElm.classList = ``;
}

async function refreshProfile(homepage) {
  document.getElementById("refreshButton").disabled = true;
  profileElm.classList = '';
  ensLoaderElm.innerHTML = `<br></br><br></br><br></br><br></br><br></br><br></br><br></br> <span style="font-size: 22px;">Connecting ...</span>`;
  setTimeout(function(){
    displayENSProfile(homepage);
    document.getElementById("refreshButton").disabled = true;
  }, 3*1000);
  setTimeout(function(){
    document.getElementById("refreshButton").disabled = false;
  }, 15*1000);
}

const refreshButton = document.getElementById('refreshButton');
refreshProfile(homepage);
