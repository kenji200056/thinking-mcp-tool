




# MCP Think Tool

これは、Anthropic のエンジニアリングブログで紹介された「Think Tool」をMCPサーバーとして実装したものです。Think Tool は、Claude が複雑な問題を分解し、思考能力を高めるための、シンプルで効果的なプロンプトエンジニアリング手法です。

## 仕組み

Think Tool は非常にシンプルで、入力をそのまま返すだけの「no-op（何もしない）ツール」です。しかし、このシンプルさが Claude に以下のような高度な思考を可能にします：

1. 一度立ち止まって、複雑な問題を整理して考える  
2. 推論を段階的に分解する  
3. 思考を体系的に整理する  
4. 複雑な計算の途中結果を一時的に保持する  
5. 問題解決の過程を明示的に記述する  

Anthropic によれば、これは「プロンプトエンジニアリングのテクニック」であり、ツール呼び出しの仕組みを活用して `"think"` というツールを定義し、「何もしない」ように設計されています。実装は不要で、モデルがツールを使う際に一度立ち止まり、追加の思考を文脈に書き出すきっかけとなります。

## 実装の詳細

この MCP サーバーは以下の 1 つのツールを提供します：

1. `think` - 思考内容を入力として受け取り、そのまま返すツール

ツール定義：

```json
{
  "name": "think",
  "description": "Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed.",
  "input_schema": {
    "type": "object",
    "properties": {
      "thought": {
        "type": "string",
        "description": "A thought to think about."
      }
    },
    "required": ["thought"]
  }
}
```

## 使い方

### セットアップ

1. このリポジトリをクローンします  
2. `npm install` を実行して依存関係をインストールします  
3. `npm run build` を実行してTypeScriptをビルドします  
4. `npm start` を実行してMCPサーバーを起動します  

### Claude Desktopとの連携

以下のように、Claude Desktopの設定ファイルにこのサーバーを追加してください：

```json
{
  "mcpServers": {
    "think-tool": {
      "command": "node",
      "args": ["/path/to/thinking-mcp-tool/build/index.js"]
    }
  }
}
```

また、LLMにThink Toolの使い方を教えるには、以下のプロンプトを追加してください：

```
## think ツールの使い方（Using the think tool）

ツールの実行結果を受け取った後に何らかのアクションを起こす前や、ユーザーに返答する前に、thinkツールを「思考メモ」として使用してください。

- 現在のリクエストに適用される具体的なルールを列挙する  
- 必要な情報がすべて揃っているか確認する  
- 予定している行動がすべてのポリシーに準拠しているか確認する  
- ツールの結果を検証しながら見直す  

以下は、thinkツール内でどのように思考を整理するかの例です：

<think_tool_example_1>  
ユーザーがフライトABC123をキャンセルしたいと言っている場合：

- 確認が必要な情報：ユーザーID、予約ID、キャンセル理由  
- キャンセル規定の確認：
  * 予約から24時間以内か？
  * そうでない場合は、チケットの種別や保険内容を確認  
- 飛行済みセグメントや過去のフライトが含まれていないか確認  
- 対応方針：不足している情報を集め、ルールを確認し、最終確認を取る  
</think_tool_example_1>

<think_tool_example_2>  
ユーザーがニューヨーク行きのチケット3枚と、各チケットにつき2個の受託手荷物を希望している場合：

- ユーザーIDが必要（以下の確認に使う）：
  * 手荷物無料枠に関するメンバーシップレベルの確認  
  * 登録済みの支払い方法の確認  
- 手荷物料金の計算：
  * エコノミークラス × 3名分  
  * 通常会員：1つ無料 → 超過3個 = $150  
  * シルバー会員：2つ無料 → 超過0個 = $0  
  * ゴールド会員：3つ無料 → 超過0個 = $0  
- 支払いルールの確認：
  * 利用できるのは「トラベルクーポン1枚」「クレジットカード1枚」「ギフトカード最大3枚」まで  
  * すべての支払い方法が登録済みである必要あり  
  * トラベルクーポンの残額は返金されない（使い切り）  
- 対応方針：
1. ユーザーIDを取得  
2. メンバーシップレベルを確認して手荷物料金を算出  
3. 支払い方法の組み合わせがポリシーに沿っているか確認  
4. 総額を計算（チケット代＋手荷物料金）  
5. 明確な同意を得てから予約を確定  

</think_tool_example_2>
```

`/path/to/mcp-think-tool` の部分は、実際のローカルパスに置き換えてください。

## 使用例

Claudeは以下のように、Think Toolを使って問題を整理・解決することができます：

```
235 × 47 を解く：

Think: まず分解して考えよう。235 に 47 をかける必要がある。
Think: まず 235 × 40 = 9,400 を計算する。
Think: 次に 235 × 7 = 1,645 を計算する。
Think: 最後に合計する：9,400 + 1,645 = 11,045

つまり、235 × 47 = 11,045
```

あるいは、より複雑な推論タスクでは：

```
Think: 与えられた問題を丁寧に分析する必要がある。質問は「5年間で二酸化炭素排出量を15%削減することの影響」について。
Think: まず、基準となる現在の排出量を確認。年間5,000万トンと記載がある。
Think: 5年で15%の削減ということは、年平均3%の削減に相当（直線的と仮定）。
Think: 5年後の年間排出量は 50 × (1 - 0.15) = 42.5（単位：百万トン）。
Think: 5年間の削減総量は、各年の削減量を合計することで計算できる...
```

## 開発情報

- `src/index.ts` - MCPサーバーの実装本体

## ライセンス

ISC

```java
import java.io.*;
import java.text.NumberFormat;
import java.util.Locale;

public class Read {
    public void displayFileContents(String filePath) {
        final int TW=8, NW=33, MW=10, SW=16;
        String sep = "|-" + "-".repeat(TW) + "-+" + "-".repeat(NW) + "-+" + "-".repeat(MW) + "-+" + "-".repeat(SW) + "-|";
        String border = "|=" + "=".repeat(sep.length() - 2) + "=|";
        String rowFmt = "| %-" + TW + "s | %-" + NW + "s | %-" + MW + "s | %" + SW + "s |\n";

        try (BufferedReader r = new BufferedReader(new FileReader(filePath))) {
            if (!"ticker,product_name,market,shares_issued".equals(r.readLine())) {
                System.err.println("エラー: CSVファイルのヘッダーが仕様と異なります。");
                return;
            }
            System.out.println("銘柄マスタを表示します。");
            System.out.println(border);
            System.out.printf("| %-" + TW + "s | %-" + NW + "s | %-" + MW + "s | %-" + SW + "s |\n", "Ticker", "Product Name", "Market", "Shares Issued");
            System.out.println(sep);

            String line;
            while ((line = r.readLine()) != null) {
                String[] p = line.split(",", -1);
                if (p.length != 4) { System.err.println("エラー: CSVの列数が4つではありません。"); return; }
                
                String market;
                switch (p[2]) {
                    case "P": market = "Prime"; break;
                    case "S": market = "Standard"; break;
                    case "G": market = "Growth"; break;
                    default: System.err.println("エラー: 不明な市場コードです: " + p[2]); return;
                }
                String name = p[1].trim();
                if (name.length() > NW) name = name.substring(0, NW - 3) + "...";
                
                try {
                    String shares = NumberFormat.getNumberInstance(Locale.US).format(Long.parseLong(p[3]));
                    System.out.printf(rowFmt, p[0], name, market, shares);
                } catch (NumberFormatException e) {
                    System.err.println("エラー: 発行済み株式数が数値ではありません: " + p[3]);
                    return;
                }
            }
            System.out.println(border);
        } catch (IOException e) {
            System.err.println("エラー: ファイルが見つからないか、読み込み中にエラーが発生しました。");
        }
    }
}

```
```java
import java.io.*;
import java.util.*;
import java.util.regex.Pattern;

public class Write {
    public void addNewStock(String filePath) {
        Set<String> tickers = new HashSet<>();
        try (Scanner fileScanner = new Scanner(new File(filePath))) {
            if (fileScanner.hasNextLine()) fileScanner.nextLine(); // Skip header
            while (fileScanner.hasNextLine()) {
                String[] parts = fileScanner.nextLine().split(",", -1);
                if (parts.length > 0) tickers.add(parts[0]);
            }
        } catch (FileNotFoundException e) {
            // ファイルが存在しない場合は、このまま新規作成されるので問題なし
        }

        Scanner in = new Scanner(System.in);
        String t, n, m;
        long s;

        while (true) {
            System.out.print("銘柄コード> ");
            String i = in.nextLine().toUpperCase();
            if (Pattern.matches("[0-9][A-Z0-9][0-9][A-Z0-9]", i) && !"BEIOQVZ".contains(""+i.charAt(1)) && !"BEIOQVZ".contains(""+i.charAt(3)) && !tickers.contains(i)) {
                t = i; break;
            }
            System.out.println("エラー: 銘柄コードの形式が正しくないか、既に使用されています。");
        }
        while (true) {
            System.out.print("銘柄名> ");
            n = in.nextLine().trim();
            if (!n.isEmpty()) break;
            System.out.println("エラー: 銘柄名は空にできません。");
        }
        while (true) {
            System.out.print("上場市場> ");
            String i = in.nextLine().toLowerCase();
            if (i.equals("prime") || i.equals("standard") || i.equals("growth")) {
                m = String.valueOf(i.charAt(0)).toUpperCase(); break;
            }
            System.out.println("エラー: Prime, Standard, Growthのいずれかを入力してください。");
        }
        while (true) {
            System.out.print("発行済み株式数> ");
            try {
                s = Long.parseLong(in.nextLine());
                if (s > 0 && s < 1000000000000L) break;
            } catch (NumberFormatException e) { /* エラーメッセージへ続く */ }
            System.out.println("エラー: 1以上の正しい数値を入力してください。");
        }

        try (PrintWriter w = new PrintWriter(new FileWriter(filePath, true))) {
            w.println(t + "," + n + "," + m + "," + s);
            System.out.println(n + " を新規銘柄として登録しました。");
        } catch (IOException e) {
            System.err.println("エラー: ファイルへの書き込みに失敗しました。");
        }
    }
}






```

