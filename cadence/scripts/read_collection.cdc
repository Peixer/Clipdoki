import HackathonNFTCollection from 0xHackathonNFTCollection

access(all) fun main(address: Address): [UInt64] {
    let account = getAccount(address)
    let collectionCap = account.capabilities.get<&HackathonNFTCollection.Collection>(/public/HackathonNFTCollection)
    
    if collectionCap == nil {
        return []
    }
    
    let collection = collectionCap!
    return collection.getIDs()
} 