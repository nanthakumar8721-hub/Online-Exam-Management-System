const mongoose = require('mongoose');
require('dotenv').config();

const clear = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB:', process.env.MONGODB_URI);

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        if (collections.length === 0) {
            console.log('ℹ️  No collections found — database is already empty.');
        } else {
            for (const col of collections) {
                await db.dropCollection(col.name);
                console.log(`🗑️  Dropped: ${col.name}`);
            }
            console.log(`\n✅ Done — cleared ${collections.length} collection(s).`);
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

clear();
