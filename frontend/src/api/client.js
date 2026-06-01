export const runSort = async (algorithm, array) => {
    const res = await fetch('/api/sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ array, algorithm }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
};

export const runPathfind = async (algorithm, rows, cols, startR, startC, endR, endC, walls) => {
    const res = await fetch('/api/pathfind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm, gridRows: rows, gridCols: cols, startR, startC, endR, endC, walls }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
};
