import { auth, database, storage } from "./firebase.js";
import {
  ref,
  get,
  set,
  push,
  child,
  serverTimestamp,
  query,
  orderByChild,
  equalTo,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

const initialGames = [
  {
    id: "elden-ring",
    title: "Elden Ring",
    imageUrl:
      "https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg?t=1719589698",
  },
  {
    id: "minecraft",
    title: "Minecraft",
    imageUrl: "../Minecraft_capa.png",
  },
  {
    id: "forza-horizon-5",
    title: "Forza Horizon 5",
    imageUrl:
      "https://cdn.akamai.steamstatic.com/steam/apps/1551360/header.jpg?t=1713233361",
  },
  {
    id: "counter-strike-2",
    title: "Counter-Strike 2",
    imageUrl:
      "https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg?t=1698860631",
  },
  {
    id: "gta-v",
    title: "Grand Theft Auto V",
    imageUrl:
      "https://cdn.akamai.steamstatic.com/steam/apps/271590/header.jpg?t=1719568474",
  },
  {
    id: "the-last-of-us",
    title: "The Last of Us Part I",
    imageUrl:
      "https://cdn.akamai.steamstatic.com/steam/apps/1888930/header.jpg?t=1695922103",
  },
  {
    id: "the-witcher-3",
    title: "The Witcher 3: Wild Hunt",
    imageUrl:
      "https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg?t=1702551111",
  },
  {
    id: "red-dead-2",
    title: "Red Dead Redemption 2",
    imageUrl:
      "https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg?t=1695665898",
  },
  {
    id: "resident-evil-4",
    title: "Resident Evil 4",
    imageUrl:
      "https://cdn.akamai.steamstatic.com/steam/apps/2050650/header.jpg?t=1716883408",
  },
  {
    id: "hollow-knight",
    title: "Hollow Knight",
    imageUrl:
      "https://cdn.akamai.steamstatic.com/steam/apps/367520/header.jpg?t=1667343555",
  },
  {
    id: "god-of-war",
    title: "God of War",
    imageUrl:
      "https://cdn.akamai.steamstatic.com/steam/apps/1593500/header.jpg?t=1695665876",
  },
];

export async function createUserProfile(user, displayName) {
  const userRef = ref(database, `users/${user.uid}`);
  await set(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: displayName,
    photoURL: "",
  });
}

export async function getUserProfile(userId) {
  const userRef = ref(database, `users/${userId}`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? snapshot.val() : null;
}

export async function uploadProfilePicture(userId, file) {
  const filePath = `profile-pictures/${userId}`;
  const fileRef = storageRef(storage, filePath);
  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);
  const userRef = ref(database, `users/${userId}/photoURL`);
  await set(userRef, downloadURL);
  return downloadURL;
}

export async function seedDatabase() {
  const gamesRef = ref(database, "games");
  const snapshot = await get(gamesRef);
  if (!snapshot.exists() || Object.keys(snapshot.val()).length === 0) {
    const gamesData = {};
    initialGames.forEach((game) => {
      gamesData[game.id] = { title: game.title, imageUrl: game.imageUrl };
    });
    await set(gamesRef, gamesData);
  }
}

export async function fetchGames() {
  const gamesRef = ref(database, "games");
  const snapshot = await get(gamesRef);
  if (snapshot.exists()) {
    const gamesData = snapshot.val();
    return Object.keys(gamesData).map((key) => ({
      id: key,
      ...gamesData[key],
    }));
  }
  return [];
}

export async function submitReview(gameId, rating, text, user) {
  const reviewsRef = ref(database, "reviews");
  const newReviewRef = push(reviewsRef);

  await set(newReviewRef, {
    reviewId: newReviewRef.key,
    gameId,
    userId: user.uid,
    userEmail: user.email,
    rating: parseInt(rating),
    text,
    createdAt: serverTimestamp(),
  });
}

export async function deleteReview(reviewId) {
  const reviewRef = ref(database, `reviews/${reviewId}`);
  await remove(reviewRef);
}

const processReviewsSnapshot = (snapshot) => {
  const reviews = [];
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      reviews.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
  }
  return reviews.sort((a, b) => b.createdAt - a.createdAt);
};

export function onGameReviewsSnapshot(gameId, callback) {
  const reviewsQuery = query(
    ref(database, "reviews"),
    orderByChild("gameId"),
    equalTo(gameId)
  );
  return onValue(reviewsQuery, (snapshot) => {
    callback(processReviewsSnapshot(snapshot));
  });
}

export function onAllReviewsSnapshot(gamesData, callback) {
  const reviewsRef = ref(database, "reviews");
  return onValue(reviewsRef, (snapshot) => {
    const reviews = processReviewsSnapshot(snapshot).map((review) => {
      const game = gamesData.find((g) => g.id === review.gameId);
      return {
        ...review,
        gameTitle: game ? game.title : "Jogo Desconhecido",
      };
    });
    callback(reviews);
  });
}

export function onUserReviewsSnapshot(userId, gamesData, callback) {
  const reviewsQuery = query(
    ref(database, "reviews"),
    orderByChild("userId"),
    equalTo(userId)
  );
  return onValue(reviewsQuery, (snapshot) => {
    const reviews = processReviewsSnapshot(snapshot).map((review) => {
      const game = gamesData.find((g) => g.id === review.gameId);
      return {
        ...review,
        gameTitle: game ? game.title : "Jogo Desconhecido",
      };
    });
    callback(reviews);
  });
}
