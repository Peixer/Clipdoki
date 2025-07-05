access(all) contract HackathonNFTCollection {
    
    access(contract) var counter: UInt64

    init() {
        self.counter = 0
    }

    access(all) fun mintNFT(description: String): @NFT {
        self.counter = self.counter + 1
        return <- create NFT(initID: self.counter, initDescription: description)
    }

    access(all) fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    access(all) resource Collection {
        access(all) var ownedNFTs: @[NFT]
        access(all) var ownedNFTIDs: [UInt64]

        init() {
            self.ownedNFTs <- []
            self.ownedNFTIDs = []
        }

        access(all) fun withdraw(withdrawID: UInt64): @NFT {
            let index: Int? = self.ownedNFTIDs.firstIndex(of: withdrawID)
            if index == nil {
                panic("This NFT does not exist in this collection.")
            }
            
            let nft <- self.ownedNFTs.remove(at: index!)
            self.ownedNFTIDs.remove(at: index!)
            
            return <- nft
        }

        access(all) fun deposit(token: @NFT) {
            let nft: @HackathonNFTCollection.NFT <- token
            let id: UInt64 = nft.id
            self.ownedNFTs.append(<- nft)
            self.ownedNFTIDs.append(id)
        }

        access(all) fun getIDs(): [UInt64] {
            return self.ownedNFTIDs
        }

        access(all) fun getNFTCount(): Int {
            return self.ownedNFTs.length
        }
    }

    access(all) resource NFT {
        access(all) let id: UInt64
        access(all) var metadata: {String: String}

        init(initID: UInt64, initDescription: String) {
            self.id = initID
            self.metadata = {"description": initDescription}
        }
    }
}