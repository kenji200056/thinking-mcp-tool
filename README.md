




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

## 使い方

### セットアップ

1. このリポジトリをクローンします  
2. `npm install` を実行して依存関係をインストールします  
3. `npm run build` を実行してTypeScriptをビルドします  
4. `npm start` を実行してMCPサーバーを起動します  

### Claude Desktopとの連携

以下のように、Claude Desktopの設定ファイルにこのサーバーを追加してください：


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
Think: 5年間の削減総量は、各年の削減量を合計することで計算
```

## 開発情報

- `src/index.ts` - MCPサーバーの実装本体

## ライセンス

IS

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * CSVファイルを読み込み、指定されたクラスにマッピングして表示する。
 * (inputDateは表示しないバージョン)
 */
public class CsvSorter {

    private static final DateTimeFormatter CSV_DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static void main(String[] args) {
        // このmainメソッドの内容は一切変更ありません
        String csvFilePath = "sample.csv";

        try {
            List<Side> records = new ArrayList<>();
            try (BufferedReader br = Files.newBufferedReader(Paths.get(csvFilePath))) {
                br.readLine(); 

                String line;
                while ((line = br.readLine()) != null) {
                    String[] row = line.split(",");
                    if (row.length != 6) {
                        System.err.println("警告: スキップされた不正な列数を持つ行 -> " + line);
                        continue;
                    }

                    try {
                        LocalDateTime tradeDate = LocalDateTime.parse(row[0], CSV_DATE_TIME_FORMATTER);
                        String tick = row[1];
                        String side = row[2];
                        int quantity = Integer.parseInt(row[3]);
                        double issuedPrice = Double.parseDouble(row[4]);
                        // inputDateはCSVから読み込み、オブジェクトには保持されます
                        LocalDateTime inputDate = LocalDateTime.parse(row[5], CSV_DATE_TIME_FORMATTER);

                        records.add(new Side(tradeDate, tick, side, quantity, issuedPrice, inputDate));

                    } catch (Exception e) {
                        System.err.println("警告: スキップされたデータ形式が不正な行 -> " + line);
                    }
                }
            }

            records.sort(Comparator.comparing(Side::getTradeDate).reversed());

            // 変更された出力メソッドを呼び出す
            printFormattedTable(records);

        } catch (IOException e) {
            System.err.println("ファイルの読み込みに失敗しました: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("処理中に予期せぬエラーが発生しました: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * ソート済みのデータリストを整形してテーブル形式でコンソールに出力する。
     * (inputDate列を表示しないように修正)
     */
    private static void printFormattedTable(List<Side> data) {
        // ▼▼ 変更点① ▼▼ フォーマット定義からinputDateの指定を削除
        String headerFormat = "| %-10s | %-8s | %-6s | %-6s | %,10s | %,13s |%n";
        String dataFormat   = "| %-10s | %-8s | %-6s | %-6s | %,10d | %,13.2f |%n";
        String border       = "+------------+----------+--------+--------+------------+---------------+";

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");

        System.out.println("======================================================================");
        // ▼▼ 変更点② ▼▼ ヘッダーの引数から "inputDate" を削除
        System.out.printf(headerFormat, "tradeDate", "time", "tick", "side", "quantity", "issuedPrice");
        System.out.println(border);

        for (Side record : data) {
            // ▼▼ 変更点③ ▼▼ データ表示の引数から record.getInputDate() を削除
            System.out.printf(dataFormat,
                    record.getTradeDate().format(dateFormatter),
                    record.getTradeDate().format(timeFormatter),
                    record.getTick(),
                    record.getSide(),
                    record.getQuantity(),
                    record.getIssuedPrice()
            );
        }
        System.out.println("======================================================================");
    }
}

ーーーー
try {
            // 文字列の形式が yyyy/MM/dd ... であることを前提とする
            if (dateTimeStr.length() >= 10) {
                int year = Integer.parseInt(dateTimeStr.substring(0, 4));
                int month = Integer.parseInt(dateTimeStr.substring(5, 7));
                int day = Integer.parseInt(dateTimeStr.substring(8, 10));

                // 月が2月、日が29日で、かつその年が閏年で「ない」場合
                if (month == 2 && day == 29 && !Year.isLeap(year)) {
                    return false; // 存在しない日付なので不正
                }
            }
        } catch (NumberFormatException | IndexOutOfBoundsException e) {
            // 年月日の抽出に失敗した場合（形式が不正）
            return false;
        }

try {
            // 文字列から年・月・日を抽出
            int year = Integer.parseInt(dateTimeStr.substring(0, 4));
            int month = Integer.parseInt(dateTimeStr.substring(5, 7));
            int day = Integer.parseInt(dateTimeStr.substring(8, 10));

            // 月が2月、日が29日の場合のみ、閏年チェックを行う
            if (month == 2 && day == 29) {
                // 閏年かどうかを判定
                boolean isLeap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
                
                // もし閏年で「ない」なら、存在するはずのない日付なので false
                if (!isLeap) {
                    return false;
                }
            }
        } catch (NumberFormatException | IndexOutOfBoundsException e) {
            // 年月日の抽出に失敗した場合（形式が不正）
            return false;
        }
        try {
            // "uuuu"は西暦年を表し、"yyyy"より厳密です。どちらでも多くの場合問題ありません。
            // ResolverStyle.STRICT で、カレンダーに存在しない日付をエラーにします。
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm")
                                                            .withResolverStyle(ResolverStyle.STRICT);
            
            // 解析を試みる。失敗すると DateTimeParseException が発生する。
            LocalDateTime.parse(dateTimeStr, formatter);
            
            return true; // 解析成功
            
        } catch (DateTimeParseException e) {
            return false; // 解析失敗 (形式が違う or 存在しない日時)
        }



```
