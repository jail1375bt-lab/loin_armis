# LOIN ARMIS — サイト内決済（Stripe）セットアップ手順

このサイトは「支払いまでサイト内で完結」する構成です（Shopifyに飛びません）。
カート → CHECKOUT → checkout.html の埋め込み決済（カード/Apple Pay/コンビニ/海外）で完了します。

## 重要：デプロイ方法が変わります
サーバーレス関数（/api）とnpm依存（stripe）を使うため、
**vercel.com/drop（静的アップロード）では動きません。** Git か Vercel CLI でデプロイしてください。

### 一番簡単（Vercel CLI）
1. このフォルダで `npm install`
2. `npm i -g vercel`
3. `vercel`（初回）→ プロジェクト作成
4. 環境変数を設定：`vercel env add STRIPE_SECRET_KEY`（本番は Production を選択）
5. `vercel --prod`

## Stripe 側の準備
1. Stripe アカウント作成（https://stripe.com）。事業者情報・本人確認を提出（本番決済に必須）。
2. ダッシュボードで支払い方法を有効化：カード / Apple Pay / Google Pay / コンビニ(Konbini) / 海外通貨。
3. APIキーを取得：
   - 公開キー `pk_live_...`（または `pk_test_...`）→ `pay-config.js` の `window.STRIPE_PK` に記入。
   - 秘密キー `sk_live_...` → **Vercelの環境変数 STRIPE_SECRET_KEY** に設定（コード/ファイルには絶対書かない）。
4. Apple Pay を使う場合：Stripe で「Apple Pay ドメイン登録」を行う（独自ドメインを登録）。

## 価格・在庫の管理
- 価格は `api/create-payment-intent.js` の PRICES（サーバー側）を正とします。商品を増減したらここも更新。
- SOLD OUT は SOLD（id指定）で購入不可。
- 在庫数の自動管理はこの構成には含まれません（必要なら Supabase 等のDBを追加して在庫チェック/注文保存を実装）。
- 注文・売上・返金は Stripe ダッシュボードで確認/操作できます。

## テスト
- テストキー（pk_test / sk_test）+ テストカード `4242 4242 4242 4242` で動作確認 → 問題なければ本番キーに差し替え。

## 注意
- あと払い(Paidy)は今回未対応（カード中心）。必要になったら別途 KOMOJU 連携を追加。
- 特定商取引法表記・プライバシーポリシー・返品ポリシーのページは別途用意してください（フッターからリンク）。
