let monthlyRequestCount = 0;
let currentMonth = new Date().getMonth();

function checkMonth() {
  const now = new Date().getMonth();
  if (now !== currentMonth) {
    monthlyRequestCount = 0;
    currentMonth = now;
  }
}

export function trackRequest(): void {
  checkMonth();
  monthlyRequestCount++;
}

export function getRemainingRequests(): number {
  checkMonth();
  return Math.max(0, 50 - monthlyRequestCount);
}

export function canMakeRequest(): boolean {
  checkMonth();
  return monthlyRequestCount < 50;
}

export function getUsedRequests(): number {
  checkMonth();
  return monthlyRequestCount;
}
