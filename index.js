const puppeteer = require('puppeteer');
const TARGET_URL = 'https://twitter.com';

const username_or_email = 'test_username';
const password = 'test_password';
const target_username = 'test_target_username'; // @を除く
const target_list_name = 'test_list_name';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100
    });

    const page = await browser.newPage();
    await page.goto(TARGET_URL);

    // ログインボタンクリック
    let login_selector = '.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1niwhzg.r-p1n3y5.r-sdzlij.r-1phboty.r-rs99b7.r-1loqt21.r-1w2pmg.r-ku1wi2.r-1vuscfd.r-1dhvaqw.r-1ny4l3l.r-1fneopy.r-o7ynqc.r-6416eg.r-lrvibr';
    await page.click(login_selector);


    // ログイン情報入力
    let username_or_email_selector = 'input[name="session[username_or_email]"]';
    let password_selector = 'input[name="session[password]"]';
    await page.waitForSelector(username_or_email_selector);
    await page.type(username_or_email_selector, username_or_email);
    await page.type(password_selector, password);

    // ログインボタンクリック
    login_selector = '.css-18t94o4.css-1dbjc4n.r-urgr8i.r-42olwf.r-sdzlij.r-1phboty.r-rs99b7.r-1w2pmg.r-vlx1xi.r-zg41ew.r-1jayybb.r-17bavie.r-1ny4l3l.r-15bsvpr.r-o7ynqc.r-6416eg.r-lrvibr';
    await page.click(login_selector);

    // 検索ボタンクリック
    let search_selector = 'a[href="/explore"]';
    await page.waitForSelector(search_selector);
    await page.click(search_selector);

    let search_area_selector = '.r-30o5oe.r-1niwhzg.r-17gur6a.r-1yadl64.r-deolkf.r-homxoj.r-poiln3.r-7cikom.r-1ny4l3l.r-1sp51qo.r-1lrr6ok.r-1dz5y72.r-fdjqy7.r-13qz1uu';
    await page.waitForSelector(search_area_selector);
    await page.type(search_area_selector, `@${target_username}`);
    await page.keyboard.press('Enter');

    // 検索
    let people_selector = '.css-901oao.r-hkyrab.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-glunga.r-1jeg54m.r-qvutc0';
    await page.waitForSelector(people_selector);
    // 一人目クリック
    await page.$$eval(people_selector, selector => {
        selector[0].click();
    });

    // フォロワーをクリック
    let followers_selector = `a[href="/${target_username}/followers"]`;
    await page.waitForSelector(followers_selector);
    await page.click(followers_selector);


    // リスト追加していくユーザー
    let user_set = new Set();

    let follower_list_selector = 'div.css-901oao.css-bfa6kz.r-1re7ezh.r-18u37iz.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-qvutc0 span.css-901oao.css-16my406.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0';
    await page.waitForSelector(follower_list_selector);

    let total_height = 0;
    let distance = 300;
    let scroll_height = 0;

    while (true) {
        if (total_height > scroll_height) break;

        scroll_height = await page.evaluate(() => document.body.scrollHeight);

        let u_array = await page.$$eval(follower_list_selector, (selector) => {
            let u_arr = [];
            for (let l of selector) {
                u_arr.push(l.innerText);
            }
            return u_arr;
        });

        if (!!u_array.length) {
            for (let u of u_array) {
                user_set.add(u);
            }
        }

        await page.evaluate((distance) => {
            window.scrollBy(0, distance);
        }, distance);

        total_height += distance;

        await page.waitFor(100);
    }

    console.log('-----------------------------------------');
    console.log(`${user_set.size}人のフォロワー情報を取得完了`);
    console.log('-----------------------------------------');

    // リスインしていく
    for (let u_name of user_set) {
        // 検索ボタンクリック
        let search_selector = 'a[href="/explore"]';
        await page.waitForSelector(search_selector);
        await page.click(search_selector);

        // 検索窓にユーザーネーム入力
        let search_area_selector = '.r-30o5oe.r-1niwhzg.r-17gur6a.r-1yadl64.r-deolkf.r-homxoj.r-poiln3.r-7cikom.r-1ny4l3l.r-1sp51qo.r-1lrr6ok.r-1dz5y72.r-fdjqy7.r-13qz1uu';
        await page.waitForSelector(search_area_selector);
        await page.type(search_area_selector, u_name);
        await page.keyboard.press('Enter');

        // 検索
        let people_selector = '.css-901oao.r-hkyrab.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-glunga.r-1jeg54m.r-qvutc0';
        await page.waitForSelector(people_selector);
        // 一人目クリック
        await page.$$eval(people_selector, selector => {
            selector[0].click();
        });

        // (...)クリック
        let detail_selector = 'div.css-18t94o4.css-1dbjc4n.r-1niwhzg.r-p1n3y5.r-sdzlij.r-1phboty.r-rs99b7.r-1w2pmg.r-15d164r.r-zso239.r-1vuscfd.r-53xb7h.r-1ny4l3l.r-mk0yit.r-o7ynqc.r-6416eg.r-lrvibr div.css-901oao.r-1awozwy.r-13gxpu9.r-6koalj.r-18u37iz.r-16y2uox.r-1qd0xha.r-a023e6.r-vw2c0b.r-1777fci.r-eljoum.r-dnmrzs.r-bcqeeo.r-q4m81j.r-qvutc0';
        await page.waitForSelector(detail_selector);
        await page.click(detail_selector);

        // リストに追加をクリック
        let add_or_remove_list_selector = 'a[href="/i/lists/add_member"]';
        await page.waitForSelector(add_or_remove_list_selector);
        await page.click(add_or_remove_list_selector);

        // リスト選択
        let list_selector = 'div.css-901oao.r-hkyrab.r-1qd0xha.r-a023e6.r-vw2c0b.r-ad9z0x.r-bcqeeo.r-qvutc0 span.css-901oao.css-16my406.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0';
        await page.waitForSelector(list_selector);
        await page.$$eval(list_selector, (selector, list_name) => {
            for (let l of selector) {
                if (l.innerText == list_name) l.click();
            }
        }, target_list_name);

        // 選択したリストへ追加
        let save_selector = '.css-18t94o4.css-1dbjc4n.r-urgr8i.r-42olwf.r-sdzlij.r-1phboty.r-rs99b7.r-1w2pmg.r-1n0xq6e.r-1vsu8ta.r-aj3cln.r-1ny4l3l.r-1fneopy.r-o7ynqc.r-6416eg.r-lrvibr';
        await page.waitForSelector(save_selector);
        await page.click(save_selector);
    }

    await browser.close();
})();
