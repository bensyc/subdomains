import { ethers } from 'ethers';

const homepage = document.currentScript.getAttribute('homepage');

const profileElm = document.getElementById('profile');
const noProfileElm = document.getElementById('noProfile');
const welcomeElm = document.getElementById('welcome');

const ensLoaderElm = document.getElementById('ensLoader');
const ensContainerElm = document.getElementById('ensContainer');
const ensTableElm = document.getElementById('ensTable');

const ensAddress = "https://api.thegraph.com/subgraphs/name/ensdomains/ens";
const tablePrefix = ``;

// const homepage = 'sshmatrix.eth';
const provider = ethers.getDefaultProvider('homestead');

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
            }
          registrations(where:{ labelName: "${ensName.slice(0,-4)}" })
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
    let balance = 5000;
    if (domains.length > 0) {
      if (resolver) {
        for (let i = 0, x = domains.length; i < x; i++) {
            let domain = domains[i];
            let registration = registrations[i];
            if (domain.name === ensName && registration.labelName === ensName.slice(0,-4)) {
                textKeys = domain.resolver.texts;
                resolvedAddress = domain.resolvedAddress.id;
                createdAt = domain.createdAt;
                ttl = domain.ttl;
                owner = domain.owner.id;
                transactionID = registration.events[0].transactionID;
                registrationDate = Number(registration.registrationDate);
                expiryDate = Number(registration.expiryDate);
                break;
            }
        }
        nextProfile = `<tr><td>🆔 member</td><td><span style="font-family: 'SFMono'; font-weight: 400; font-size: 14px"><a href="https://alpha.ens.domains/profile/${ensName}" target="_blank">${ensName}</a></span></td></tr>`;

        nextProfile += `<tr><td>🔒 owner</td><td><span style="font-family: 'SFMono'; font-weight: 400; font-size: 14px"><a href="https://etherscan.io/address/${owner}" target="_blank">${owner.slice(0,8)}...${owner.slice(-6)}</a></span></td></tr>`

        if (resolvedAddress) {
          nextProfile += `<tr><td>➡️ address</td><td><span style="font-family: 'SFMono'; font-weight: 400; font-size: 14px"><a href="https://etherscan.io/address/${resolvedAddress}" target="_blank">${resolvedAddress.slice(0,8)}...${resolvedAddress.slice(-6)}</a></span></td></tr>`
        } else {
          nextProfile += `<tr><td>➡️ address</td><td>⚠️ no address found ⚠️</td></tr>`
        }

        nextProfile += `<tr><td>🖨️ minted</td><td><span style="font-family: 'SFMono'; font-weight: 400; font-size: 14px">${new Date(registrationDate*1000).toLocaleString("en-US")} UTC</span></td></tr>`

        nextProfile += `<tr><td>⌛ expires</td><td><span style="font-family: 'SFMono'; font-weight: 400; font-size: 14px">${new Date(expiryDate*1000).toLocaleString("en-US")} UTC</span></td></tr>`

        nextProfile += `<tr><td>✅ txn id</td><td><span style="font-family: 'SFMono'; font-weight: 400; font-size: 14px"><a href="https://etherscan.io/tx/${transactionID}" target="_blank">${transactionID.slice(0,8)}...${transactionID.slice(-6)}</a></span></td></tr>`

        nextProfile += `<tr><td>🌊 opensea</td><td><span style="font-family: 'SFMono'; font-weight: 400; font-size: 14px"><a href="https://opensea.io/assets/ethereum/${contract}/${tokenID}" target="_blank">Link 🔗</a></span></td></tr>`

        nextProfile += `<tr><td>$<img class="icon" src="ape.png"> balance</td><td><span style="font-family: 'SFMono'; font-weight: 400; font-size: 14px">${balance}</span></td></tr>`

        nextProfile += `<tr><td>$🧪 balance</td><td><span style="font-family: 'SFMono'; font-weight: 400; font-size: 14px">${balance}</span></td></tr>`
      } else {
        nextProfile = `<tr><td>member</td><td><span style="font-family: 'SFMono'; font-weight: 400; font-size: 14px"><a href="https://alpha.ens.domains/profile/${ensName}" target="_blank">${ensName}</a></span></td></tr>`;
        nextProfile += `<tr><td><span style="color: indianred;">❗ warning:</td><td>⚠️ no resolver set ⚠️</span></td></tr>`
      }
    } else {
      nextProfile = `<tr><td>🆔 member</td><td><span style="font-weight: 400; font-size: 14px; color: red;">❌ error</span></td></tr>`;
    }

    return tablePrefix + nextProfile
}

async function displayENSProfile(homepage) {
    const ensName = homepage;

    if (ensName) {
        profileElm.classList = '';
        ensLoaderElm.innerHTML = `<span style="font-size: 22px;">Loading ...</span>`;
        //welcomeElm.innerHTML = `Hello, <span style="font-family: 'SFMono'; font-weight: 600; font-size: 20px;">${ensName.slice(0,-11)}</span>${ensName.slice(-11)}`;
        welcomeElm.innerHTML = '';
        let avatar = await provider.getAvatar(ensName);
        if (avatar) {
            welcomeElm.innerHTML += `<br></br> <img type="image" class="avatar" src=${avatar}>`;
        }

        ensTableElm.innerHTML = await getENSMetadata(ensName);
        ensLoaderElm.innerHTML = '';
        ensContainerElm.classList = '';
    } else {
        //welcomeElm.innerHTML = `Hello, <span style="font-family: 'SFMono'; font-weight: 400; font-size: 10px">${address.slice(0,6)}...${address.slice(-4)}</span>`;
        welcomeElm.innerHTML = '';
        noProfileElm.classList = '';
    }

    welcomeElm.classList = '';
}

async function refreshProfile(homepage) {
  document.getElementById("refreshButton").disabled = true;
  profileElm.classList = '';
  ensLoaderElm.innerHTML = `<span style="font-size: 22px;">Connecting ...</span>`;
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
