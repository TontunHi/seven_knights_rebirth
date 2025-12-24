const fs = require('fs');
const path = require('path');

// 1. กำหนดน้ำหนักของ Grade แต่ละประเภท
const heroGradeWeight = { 'l++': 4, 'l+': 3, 'l': 2, 'r': 1 };
const petGradeWeight = { 'l': 2, 'r': 1 };
// เพิ่มน้ำหนักสำหรับ Items (Accessory/Weapon/Armor)
const itemGradeWeight = { 'l': 4, 'r': 3, 'un': 2, 'c': 1 };

// Helper: แยก Grade และ Name (สำหรับ Hero/Pet)
const getGradeAndName = (filename) => {
    const parts = filename.split('_');
    const grade = parts[0]; 
    const nameWithExt = parts.slice(1).join('_'); 
    const name = nameWithExt.replace(/\.[^/.]+$/, "");
    
    return { grade, name, filename };
};

// Function 1: ดึงรูปภาพ Hero/Pet (มี Logic เฉพาะ)
const getSortedImages = (folderName) => {
    const dirPath = path.join(__dirname, '../public/images', folderName);
    
    if (!fs.existsSync(dirPath)) return [];

    const files = fs.readdirSync(dirPath);
    const isHero = folderName === 'heroes';

    const items = files.filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file)).map(file => {
        return getGradeAndName(file);
    });

    // Sort Logic
    items.sort((a, b) => {
        const weightA = isHero ? (heroGradeWeight[a.grade] || 0) : (petGradeWeight[a.grade] || 0);
        const weightB = isHero ? (heroGradeWeight[b.grade] || 0) : (petGradeWeight[b.grade] || 0);

        if (weightB !== weightA) return weightB - weightA;
        return a.name.localeCompare(b.name);
    });

    return items;
};

// Function 2: ดึงรูปภาพ Items (Weapon/Armor/Accessory) และเรียงตาม Grade
const getImageFiles = (folderPath) => {
    const dirPath = path.join(__dirname, '../public/images', folderPath);
    
    if (!fs.existsSync(dirPath)) {
        console.warn(`Directory not found: ${dirPath}`);
        return [];
    }

    const files = fs.readdirSync(dirPath);
    const images = files.filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file));

    // Sort Logic (L > R > UN > C > Others)
    images.sort((a, b) => {
        // ฟังก์ชันช่วยดึง Grade และ Name จากชื่อไฟล์ (เช่น l_ring.png)
        const getInfo = (filename) => {
            const parts = filename.split('_');
            const grade = parts[0].toLowerCase(); // l, r, un, c
            
            // ตรวจสอบว่าเป็น Grade ที่เรารู้จักหรือไม่ ถ้าใช่ให้ Weight ถ้าไม่ใช่ให้ -1 (ไปอยู่ล่างสุด)
            const weight = itemGradeWeight[grade] !== undefined ? itemGradeWeight[grade] : -1;
            
            // ชื่อที่เหลือตัดนามสกุลไฟล์ออก
            let name = parts.slice(1).join('_').replace(/\.[^/.]+$/, "").toLowerCase();
            // กรณีชื่อไฟล์ไม่มี _ (เช่น ring.png) name จะว่าง ให้ใช้ชื่อไฟล์เดิม
            if (!name) name = filename.replace(/\.[^/.]+$/, "").toLowerCase();

            return { weight, name };
        };

        const infoA = getInfo(a);
        const infoB = getInfo(b);

        // 1. เรียงตาม Grade Weight (มากไปน้อย)
        if (infoA.weight !== infoB.weight) {
            return infoB.weight - infoA.weight;
        }
        
        // 2. ถ้า Grade เท่ากัน เรียงตามชื่อ (a-z)
        return infoA.name.localeCompare(infoB.name);
    });

    return images;
};

module.exports = {
    getGradeAndName,
    getSortedImages,
    getImageFiles
};