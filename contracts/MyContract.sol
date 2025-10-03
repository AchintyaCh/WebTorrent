// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract P2PFileMarketplace {
    struct FileListing {
        address seller;
        string title;
        string description;
        uint256 price; // in wei
        bytes encryptedPeerInfo; // encrypted JSON blob with peer info
        bool active;
    }

    uint256 public fileCount;
    mapping(uint256 => FileListing) public files;

    event FileListed(
        uint256 indexed fileId,
        address indexed seller,
        string title,
        uint256 price
    );
    event FilePurchased(
        uint256 indexed fileId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );

    // Seller lists a file with encrypted peer info
    function listFile(
        string calldata title,
        string calldata description,
        uint256 price,
        bytes calldata encryptedPeerInfo
    ) external {
        require(price >= 0, "Invalid price");

        fileCount++;
        files[fileCount] = FileListing({
            seller: msg.sender,
            title: title,
            description: description,
            price: price,
            encryptedPeerInfo: encryptedPeerInfo,
            active: true
        });

        emit FileListed(fileCount, msg.sender, title, price);
    }

    // Buyer purchases the file (if price > 0)
    function purchaseFile(uint256 fileId) external payable {
        FileListing storage listing = files[fileId];
        require(listing.active, "File not active");
        require(msg.value >= listing.price, "Insufficient payment");

        // transfer payment to seller
        if (listing.price > 0) {
            payable(listing.seller).transfer(listing.price);
        }

        emit FilePurchased(fileId, msg.sender, listing.seller, listing.price);
    }

    // Buyer retrieves encrypted peer info after purchase
    function getPeerInfo(uint256 fileId) external view returns (bytes memory) {
        FileListing storage listing = files[fileId];
        require(listing.active, "File not active");
        return listing.encryptedPeerInfo;
    }
}
