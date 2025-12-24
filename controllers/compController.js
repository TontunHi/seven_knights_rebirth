const db = require('../database/database');

exports.getStagePage = (req, res) => {
    // ดึงข้อมูลและเรียงลำดับ: Type (Stage มาก่อน) -> Main -> Sub
    const sql = `SELECT * FROM stage_comps ORDER BY 
                 CASE WHEN type = 'Stage' THEN 1 ELSE 2 END, 
                 stage_main ASC, stage_sub ASC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.render('pages/error'); // หรือ handle error ตามเหมาะสม
        }

        // Logic จัดกลุ่ม (เหมือน Admin)
        const groupedStages = {};
        
        rows.forEach(r => {
            try { r.heroes = JSON.parse(r.heroes); } catch(e) { r.heroes = []; }
            
            const key = `${r.type}_${r.stage_main}_${r.stage_sub}`;
            
            if (!groupedStages[key]) {
                groupedStages[key] = {
                    type: r.type,
                    stage_main: r.stage_main,
                    stage_sub: r.stage_sub,
                    teams: []
                };
            }
            groupedStages[key].teams.push(r);
        });

        const stagesList = Object.values(groupedStages);

        res.render('pages/comp_stage', {
            title: 'Stage & Nightmare Guide',
            page: 'comp', // Active Navbar
            stages: stagesList
        });
    });
};