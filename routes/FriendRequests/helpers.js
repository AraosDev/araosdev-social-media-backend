const updateUserAndFriendDetials = (reqType, userDetails, frndDetails) => {
  let alreadyExists = `${reqType}_ALREADY_EXISTS`;
  let updatedFrndDetails = alreadyExists,
    updatedUserDetails = alreadyExists;

  const {
    friendRequests: frndFriendReqs,
    friends: frndFriends,
    userName: frndName,
  } = frndDetails;
  const { requestedTo: frndReqTo, requestedBy: frndReqBy } = frndFriendReqs; // Seenu
  const {
    friendRequests: userFriendReqs,
    friends: userFriends,
    userName,
  } = userDetails;
  const { requestedTo: userReqTo, requestedBy: userReqBy } = userFriendReqs; // araosDev

  switch (reqType) {
    case "SEND_REQ": {
      if (!userFriends.includes(frndName) && !frndReqBy.includes(userName)) {
        updatedFrndDetails = {
          friendRequests: {
            requestedTo: [...frndReqTo],
            requestedBy: [...frndReqBy, userName],
          },
        };
        updatedUserDetails = {
          friendRequests: {
            requestedTo: [...userReqTo, frndName],
            requestedBy: [...userReqBy],
          },
        };
      }
      break;
    }

    case "ACCEPT_REQ": {
      if (!userFriends.includes(frndName)) {
        updatedUserDetails = {
          friends: [...userFriends, frndName],
          friendRequests: {
            requestedTo: userReqTo.filter((name) => name !== frndName),
            requestedBy: [...userReqBy],
          },
        };
        updatedFrndDetails = {
          friendRequests: {
            requestedTo: [...frndReqTo],
            requestedBy: frndReqBy.filter((name) => name !== userName),
          },
        };
      }
      break;
    }

    case "REJECT_REQ": {
      if (frndReqBy.includes(userName) && !userFriends.includes(frndName)) {
        updatedUserDetails = {
          friendRequests: {
            requestedTo: userReqTo.filter((name) => name !== frndName),
            requestedBy: [...userReqBy],
          },
        };
        updatedFrndDetails = {
          friendRequests: {
            requestedTo: [...frndReqTo],
            requestedBy: frndReqBy.filter((name) => name !== userName),
          },
        };
      }

      break;
    }

    case "REVOKE_REQ": {
      if (userReqTo.includes(frndName) && !userFriends.includes(frndName)) {
        updatedUserDetails = {
          friendRequests: {
            requestedTo: userReqTo.filter((name) => name !== frndName),
            requestedBy: [...userReqBy],
          },
        };
        updatedFrndDetails = {
          friendRequests: {
            requestedTo: [...frndReqTo],
            requestedBy: frndReqBy.filter((name) => name !== userName),
          },
        };
      }

      break;
    }

    case "REMOVE_FRIEND": {
      if (userFriends.includes(frndName)) {
        updatedUserDetails = {
          friends: userFriends.filter((name) => name !== frndName),
        };
        updatedFrndDetails = { ...frndDetails };
      }
    }
    default:
      break;
  }

  return { updatedUserDetails, updatedFrndDetails };
};

module.exports = {
  updateUserAndFriendDetials,
};
