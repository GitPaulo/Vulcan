/*
* Correct implementation of a fast hash table
* This is NOT a replacment for maps.
* This is to be used when storing large amounts of temporary data for fast access.
*/
class HashTable {
    constructor (limit = 8) {
        this._storage = [];
        this._count   = 0;
        this._limit   = limit;
    }

    set (key, value) {
        // Create an index for our storage location by passing it through our hashing function
        let index = this.hashFunc(key, this._limit);
        // Retrieve the bucket at this particular index in our storage, if one exists
        // [[ [k,v], [k,v], [k,v] ] , [ [k,v], [k,v] ]  [ [k,v] ] ]
        let bucket = this._storage[index];
        // Does a bucket exist or do we get undefined when trying to retrieve said index?
        if (!bucket) {
            // Create the bucket
            bucket = [];
            // Insert the bucket into our hashTable
            this._storage[index] = bucket;
        }

        let override = false;
        // Now iterate through our bucket to see if there are any conflicting
        // Key value pairs within our bucket. If there are any, override them.
        for (let i = 0; i < bucket.length; i++) {
            let tuple = bucket[i];
            if (tuple[0] === key) {
                // Overide value stored at this key
                tuple[1] = value;
                override = true;
            }
        }

        if (!override) {
            // Create a new tuple in our bucket
            // Note that this could either be the new empty bucket we created above
            // Or a bucket with other tupules with keys that are different than
            // The key of the tuple we are inserting. These tupules are in the same
            // Bucket because their keys all equate to the same numeric index when
            // Passing through our hash function.
            bucket.push([key, value]);
            this._count++;
            // Now that we've added our new key/val pair to our storage
            // Let's check to see if we need to resize our storage
            if (this._count > this._limit * 0.75) {
                this.resize(this._limit * 2);
            }
        }
        return this;
    }

    get (key) {
        let index = this.hashFunc(key, this._limit);
        let bucket = this._storage[index];

        if (!bucket) {
            return null;
        }

        for (let i = 0; i < bucket.length; i++) {
            let tuple = bucket[i];
            if (tuple[0] === key) {
                return tuple[1];
            }
        }

        return null;
    }

    remove (key) {
        let index = this.hashFunc(key, this._limit);
        let bucket = this._storage[index];
        if (!bucket) {
            return null;
        }
        // Iterate over the bucket
        for (let i = 0; i < bucket.length; i++) {
            let tuple = bucket[i];
            // Check to see if key is inside bucket
            if (tuple[0] === key) {
                // If it is, get rid of this tuple
                bucket.splice(i, 1);
                this._count--;
                if (this._count < this._limit * 0.25) {
                    this._resize(this._limit / 2);
                }
                return tuple[1];
            }
        }
    }

    hashFunc (str, max) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            let letter = str[i];
            hash = (hash << 5) + letter.charCodeAt(0);
            hash = (hash & hash) % max;
        }
        return hash;
    }

    resize (newLimit) {
        let oldStorage = this._storage;

        this._limit = newLimit;
        this._count = 0;
        this._storage = [];

        oldStorage.forEach((bucket) => {
            if (!bucket) {
                return;
            }
            for (let i = 0; i < bucket.length; i++) {
                let tuple = bucket[i];
                this.set(tuple[0], tuple[1]);
            }
        });
    }
}

module.exports = HashTable;
