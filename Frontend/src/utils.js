export const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

export const today = () => {
  const d = new Date();
  return d.toISOString().split("T")[0]; // YYYY-MM-DD in UTC
};

export const daysUntil = (dateStr) => {
  const target = parseDate(dateStr);
  if (!target) return null;

  const now = new Date();

  const utcTarget = Date.UTC(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );

  const utcNow = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  return Math.ceil((utcTarget - utcNow) / (1000 * 60 * 60 * 24));
};


export const fmtTime = (iso) => {
  const d = parseDate(iso);
  if (!d) return "—";

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const fmtDate = (d) => {
  if (!d) return "—";

  const date = new Date(d);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export const daysDiff = (startDate, endDate) => {
  
    const startDateMidnight = new Date(startDate);
    startDateMidnight.setHours(0, 0, 0, 0);

    const endDateMidnight = new Date(endDate);
    endDateMidnight.setHours(0, 0, 0, 0);

    const diff = Math.floor(
      (endDateMidnight - startDateMidnight) / 86400000
    );

    return diff;
};
