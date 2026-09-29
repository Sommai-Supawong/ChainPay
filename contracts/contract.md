// ระบุ License ของ Source Code
// MIT = อนุญาตให้นำโค้ดไปใช้ แก้ไข หรือเผยแพร่ได้ตามเงื่อนไข MIT License
// SPDX-License-Identifier: MIT


// ระบุ Version ของ Solidity Compiler
// ^0.8.24 หมายถึงใช้ Solidity ตั้งแต่ 0.8.24 ขึ้นไป
// แต่ยังไม่ถึง Version 0.9.0
pragma solidity ^0.8.24;


// อธิบาย Contract:
// ChainPay เป็นระบบ Non-Custodial
// Contract ไม่เก็บ ETH ของผู้ใช้ไว้ แต่จะส่งต่อไปยังผู้รับ
// ส่วนข้อมูล Application เช่น ชื่อรายการ / User / Description
// จะเก็บ Off-chain ใน Database
/// @notice Non-custodial ETH settlement. Application metadata remains off-chain.
contract ChainPayV2 {


    // =========================================================
    // 1. STATE VARIABLES
    // =========================================================


    // เก็บว่ารายการ Payment นี้เคยถูกชำระแล้วหรือยัง
    //
    // bytes32 = Key ที่สร้างจาก Payer + Payment ID
    // bool    = true  = จ่ายแล้ว
    //           false = ยังไม่เคยจ่าย
    //
    // public = สามารถอ่านค่าจากภายนอก Contract ได้
    //
    // ตัวอย่าง:
    // completed[key] = true
    //
    // ใช้เพื่อป้องกันผู้ใช้คนเดิมจ่าย Payment เดิมซ้ำ
    mapping(bytes32 => bool) public completed;


    // ตัวแปรสำหรับป้องกัน Reentrancy
    //
    // false = Contract พร้อมรับการเรียก pay()
    // true  = Contract กำลังประมวลผล pay() อยู่
    //
    // private = ใช้ภายใน Contract เท่านั้น
    bool private entered;



    // =========================================================
    // 2. EVENT
    // =========================================================


    // Event ที่ถูกสร้างเมื่อ Payment สำเร็จ
    //
    // ใช้เป็นหลักฐานบน Blockchain ว่า:
    // - Payment ไหน
    // - ใครเป็นผู้จ่าย
    // - ใครเป็นผู้รับ
    // - จำนวนเท่าไร
    // - เกิดขึ้นเมื่อไร
    //
    // indexed ทำให้ค้นหาข้อมูลใน Blockchain Log ได้ง่ายขึ้น
    event PaymentCompleted(
        bytes32 indexed paymentId,   // รหัสรายการชำระเงิน
        address indexed payer,       // Wallet ของผู้จ่าย
        address indexed merchant,    // Wallet ของผู้รับ
        uint256 amount,              // จำนวน ETH ที่จ่าย (ในหน่วย Wei)
        uint256 timestamp            // เวลาที่ Transaction เกิดขึ้น
    );



    // =========================================================
    // 3. CUSTOM ERRORS
    // =========================================================


    // จำนวน ETH ที่ส่งมาต้องไม่เป็น 0
    error ZeroAmount();


    // Address ของ Merchant / ผู้รับไม่ถูกต้อง
    error InvalidMerchant();


    // Payment ID ไม่ถูกต้อง
    error InvalidPaymentId();


    // Wallet นี้เคยจ่าย Payment ID นี้แล้ว
    error AlreadyPaid();


    // ส่ง ETH ไปยัง Merchant ไม่สำเร็จ
    error TransferFailed();


    // ตรวจพบการเรียก Contract ซ้ำระหว่างที่ Transaction เดิมยังไม่จบ
    error Reentrancy();



    // =========================================================
    // 4. CONTRACT VERSION
    // =========================================================


    // Function สำหรับบอก Version ของ Smart Contract
    //
    // external = เรียกจากภายนอก Contract ได้
    // pure     = ไม่อ่านและไม่แก้ข้อมูลใน Blockchain
    //
    // return 2 หมายถึง ChainPay Contract Version 2
    function version()
        external
        pure
        returns (uint256)
    {
        return 2;
    }



    // =========================================================
    // 5. MAIN PAYMENT FUNCTION
    // =========================================================


    // Function หลักสำหรับชำระเงิน
    //
    // paymentId
    // = รหัสรายการ Payment ของ ChainPay
    //
    // merchant
    // = Wallet Address ของผู้รับ
    //
    // external
    // = เรียก Function จากภายนอก Contract ได้
    //
    // payable
    // = Function นี้สามารถรับ ETH มาพร้อม Transaction ได้
    function pay(
        bytes32 paymentId,
        address payable merchant
    )
        external
        payable
    {


        // =====================================================
        // STEP 1: ป้องกัน Reentrancy
        // =====================================================


        // ถ้า Contract กำลังทำ pay() อยู่แล้ว
        // แล้วมีการพยายามเรียก pay() ซ้ำเข้ามา
        // ให้หยุด Transaction ทันที
        if (entered)
            revert Reentrancy();



        // =====================================================
        // STEP 2: ตรวจจำนวน ETH
        // =====================================================


        // msg.value = จำนวน ETH ที่ผู้ใช้ส่งมากับ Transaction
        //
        // ถ้าเป็น 0 แสดงว่าไม่ได้ส่งเงินมา
        // จึงยกเลิก Transaction
        if (msg.value == 0)
            revert ZeroAmount();



        // =====================================================
        // STEP 3: ตรวจสอบ Wallet ผู้รับ
        // =====================================================


        // Merchant ห้ามเป็น:
        //
        // address(0)
        // = Zero Address / ไม่มีผู้รับจริง
        //
        // address(this)
        // = Address ของ Contract ตัวเอง
        //
        // msg.sender
        // = Address ของผู้จ่าย
        //   ป้องกันการจ่ายให้ตัวเอง
        if (
            merchant == address(0) ||
            merchant == address(this) ||
            merchant == msg.sender
        )
            revert InvalidMerchant();



        // =====================================================
        // STEP 4: ตรวจ Payment ID
        // =====================================================


        // Payment ID ต้องไม่เป็น bytes32(0)
        //
        // เพราะ ChainPay ต้องใช้ Payment ID
        // เชื่อม Transaction บน Blockchain
        // กับรายการ Payment ในระบบ
        if (paymentId == bytes32(0))
            revert InvalidPaymentId();



        // =====================================================
        // STEP 5: สร้าง Unique Payment Key
        // =====================================================


        // ระบบไม่ได้ใช้ paymentId อย่างเดียว
        //
        // แต่ใช้:
        //
        // Wallet ผู้จ่าย + Payment ID
        //
        // มาสร้าง Key ด้วย keccak256
        //
        // ทำให้สามารถตรวจได้ว่า
        // "Wallet คนนี้ เคยจ่าย Payment นี้หรือยัง"
        //
        // abi.encode(...)
        // = แปลงข้อมูลให้อยู่ในรูปที่ Hash ได้
        //
        // keccak256(...)
        // = Hash Function หลักที่ Ethereum ใช้
        bytes32 key = keccak256(
            abi.encode(
                msg.sender,
                paymentId
            )
        );



        // =====================================================
        // STEP 6: ป้องกันการจ่ายซ้ำ
        // =====================================================


        // ถ้า Key นี้มีค่า true
        // แสดงว่า Wallet คนนี้เคยจ่าย Payment นี้แล้ว
        //
        // จึงไม่อนุญาตให้จ่ายซ้ำ
        if (completed[key])
            revert AlreadyPaid();



        // =====================================================
        // STEP 7: LOCK CONTRACT
        // =====================================================


        // ตั้ง entered = true
        // เพื่อบอกว่า Contract กำลังประมวลผล Payment อยู่
        //
        // ถ้ามีการพยายามเรียก pay() ซ้อนเข้ามา
        // จะถูก Reentrancy Protection บล็อก
        entered = true;



        // =====================================================
        // STEP 8: บันทึกว่า Payment นี้ถูกใช้แล้ว
        // =====================================================


        // ตั้งสถานะของ Key เป็น true
        // เพื่อป้องกันการจ่าย Payment เดิมซ้ำ
        completed[key] = true;



        // =====================================================
        // STEP 9: ส่ง ETH ไปยัง Merchant
        // =====================================================


        // ส่ง ETH ทั้งหมดที่ได้รับจาก msg.value
        // ไปยัง Wallet ของ Merchant
        //
        // merchant.call{value: msg.value}("")
        //
        // call = ใช้ส่ง Native ETH
        //
        // ok จะเป็น:
        // true  = ส่งสำเร็จ
        // false = ส่งไม่สำเร็จ
        (bool ok,) = merchant.call{
            value: msg.value
        }("");



        // =====================================================
        // STEP 10: ตรวจผลการส่ง ETH
        // =====================================================


        // ถ้าส่ง ETH ไม่สำเร็จ
        // Transaction ทั้งหมดจะ Revert
        if (!ok)
            revert TransferFailed();



        // =====================================================
        // STEP 11: สร้างหลักฐานบน Blockchain
        // =====================================================


        // เมื่อ Payment สำเร็จ
        // สร้าง PaymentCompleted Event
        //
        // เก็บ:
        // paymentId       = Payment ไหน
        // msg.sender      = ใครเป็นผู้จ่าย
        // merchant        = ใครเป็นผู้รับ
        // msg.value       = จำนวน ETH
        // block.timestamp = เวลาที่เกิดขึ้น
        emit PaymentCompleted(
            paymentId,
            msg.sender,
            merchant,
            msg.value,
            block.timestamp
        );



        // =====================================================
        // STEP 12: UNLOCK CONTRACT
        // =====================================================


        // Transaction เสร็จแล้ว
        // จึงปลด Lock ให้สามารถรับ Payment ถัดไปได้
        entered = false;
    }
}