import villagersData from "../data/villagers.json";

const toId = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const getAllVillagers = () =>
  villagersData.map((villager) => ({
    id: toId(villager.name),
    name: villager.name,
    gender: villager.gender,
    personality: villager.personality,
    species: villager.species,
    birthday: villager.birthday,
    zodiac: villager.zodiac,
    hobby: villager.hobby,
    catchphrase: villager.catchphrase,
    imageUrl: villager.image_url,
  }));

export const getRandomVillagers = (count) => {
  const all = getAllVillagers();
  const max = Math.min(count, all.length);
  const shuffled = [...all];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, max);
};
