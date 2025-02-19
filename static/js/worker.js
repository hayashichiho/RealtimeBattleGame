self.onmessage = async function (event) {
    const { playerId, distance } = event.data;

    try {
        await fetch('/api/update_distance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: playerId, distance: distance }),
        });
    } catch (error) {
        console.error('Error updating distance:', error);
    }
};
