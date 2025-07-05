import HackathonNFTCollection from 0xHackathonNFTCollection

transaction(description: String) {
    let collection: &HackathonNFTCollection.Collection

    prepare(signer: auth(Storage, SaveValue, Capabilities, StorageCapabilities, IssueStorageCapabilityController) &Account) {
        // Get or create the collection
        let collectionCap = signer.storage.borrow<&HackathonNFTCollection.Collection>(from: /storage/HackathonNFTCollection)
        if collectionCap == nil {
            // Create the collection if it doesn't exist
            let collection <- HackathonNFTCollection.createEmptyCollection()
            signer.storage.save(<-collection, to: /storage/HackathonNFTCollection) 
            
            // Use the storage reference directly since we just saved it
            self.collection = signer.storage.borrow<&HackathonNFTCollection.Collection>(from: /storage/HackathonNFTCollection)!
        } else {
            self.collection = collectionCap!
        }
    }

    execute {
        // Mint the NFT
        let nft <- HackathonNFTCollection.mintNFT(description: description)
        
        // Store the NFT in the collection
        self.collection.deposit(token: <-nft)
        
        log("NFT minted and stored successfully!")
    }
}