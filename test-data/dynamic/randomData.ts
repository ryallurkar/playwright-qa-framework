import { formatDate, generateRandomEmail, generateRandomString } from '@helpers/utils';

type RandomUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

type RandomProduct = {
  name: string;
  price: number;
  category: string;
};

const firstNames = ['Liam', 'Olivia', 'Noah', 'Emma', 'Maya', 'Ethan'];
const lastNames = ['Walker', 'Bennett', 'Hayes', 'Flores', 'Singh', 'Morgan'];
const categories = ['books', 'electronics', 'fitness', 'office', 'home'];

const randomItem = <T>(items: readonly T[]): T => {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
};

export const randomUser = (): RandomUser => {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);

  return {
    email: generateRandomEmail('qa.local'),
    password: `${generateRandomString(8)}!A1`,
    firstName,
    lastName,
  };
};

export const randomProduct = (): RandomProduct => {
  const category = randomItem(categories);
  const baseName = `${category}-${formatDate(new Date())}`;

  return {
    name: `${baseName}-${generateRandomString(6)}`,
    price: Number((Math.random() * 190 + 10).toFixed(2)),
    category,
  };
};
