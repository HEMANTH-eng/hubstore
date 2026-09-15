// Converts numeric Indian Rupee amounts to Words (e.g., 74499 -> Seventy-Four Thousand Four Hundred Ninety-Nine Rupees Only)

const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];

const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function convertLessThanThousand(num: number): string {
  let str = "";
  if (num >= 100) {
    str += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }
  if (num >= 20) {
    str += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  }
  if (num > 0) {
    str += ones[num] + " ";
  }
  return str.trim();
}

export function numberToWordsRupees(amount: number): string {
  const integerPart = Math.floor(amount);
  if (integerPart === 0) return "Zero Rupees Only";

  let result = "";

  const crore = Math.floor(integerPart / 10000000);
  let remainder = integerPart % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const hundreds = remainder;

  if (crore > 0) {
    result += convertLessThanThousand(crore) + " Crore ";
  }
  if (lakh > 0) {
    result += convertLessThanThousand(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    result += convertLessThanThousand(thousand) + " Thousand ";
  }
  if (hundreds > 0) {
    result += convertLessThanThousand(hundreds) + " ";
  }

  return `Rupees ${result.trim()} Only`;
}
