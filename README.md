




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
// Trade.java
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Trade {
    private final LocalDateTime tradedDateTime;
    private final String ticker;
    private final Side side;
    private final int quantity;
    private final BigDecimal price;
    private final LocalDateTime inputDateTime; // データが入力されたシステム時刻

    public Trade(LocalDateTime tradedDateTime, String ticker, Side side, int quantity, BigDecimal price) {
        this.tradedDateTime = tradedDateTime;
        this.ticker = ticker;
        this.side = side;
        this.quantity = quantity;
        this.price = price;
        this.inputDateTime = LocalDateTime.now(); // インスタンス生成時に現在時刻を自動設定
    }

    // Getters
    public LocalDateTime getTradedDateTime() { return tradedDateTime; }
    public String getTicker() { return ticker; }
    public Side getSide() { return side; }
    public int getQuantity() { return quantity; }
    public BigDecimal getPrice() { return price; }
    public LocalDateTime getInputDateTime() { return inputDateTime; }
}
atarasienum

public enum Side {
    BUY,
    SELL;

    // 文字列からenumへ変換 (大文字・小文字を無視)
    public static Side fromString(String text) {
        if ("buy".equalsIgnoreCase(text)) {
            return BUY;
        } else if ("sell".equalsIgnoreCase(text)) {
            return SELL;
        }
        return null;
    }
}

書き込み
// TradeCsvWriter.java
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.format.DateTimeFormatter;

public class TradeCsvWriter {
    // CSVに書き込む日時のフォーマットを定義
    private static final DateTimeFormatter CSV_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public void write(String filePath, Trade trade) throws IOException {
        String line = String.join(",",
                trade.getTradedDateTime().format(CSV_FORMATTER),
                trade.getTicker(),
                trade.getSide().name(), // "BUY" or "SELL"
                String.valueOf(trade.getQuantity()),
                trade.getPrice().toPlainString(), // 指数表記なしの文字列に変換
                trade.getInputDateTime().format(CSV_FORMATTER)
        );

        // ファイルがなければヘッダーを書き込む
        if (!Files.exists(Paths.get(filePath))) {
            String header = "tradedDateTime,ticker,side,quantity,price,inputDateTime";
            try (BufferedWriter writer = Files.newBufferedWriter(Paths.get(filePath), StandardCharsets.UTF_8)) {
                writer.write(header);
            }
        }

        // データを追記
        try (BufferedWriter writer = Files.newBufferedWriter(Paths.get(filePath), StandardCharsets.UTF_8,
                StandardOpenOption.APPEND, StandardOpenOption.CREATE)) {
            writer.newLine();
            writer.write(line);
        }
    }
}

チェッカー
// Validator.java (修正)
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.regex.Pattern;

public class Validator {
    // (既存のStock関連の定数やメソッドはそのまま)
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9 .()]+$");
    private static final Pattern CODE_PATTERN = Pattern.compile("^[0-9]{3}[a-zA-Z0-9]$");
    private static final long MIN_SHARES = 1L;
    private static final long MAX_SHARES = 999_999_999_999L;

    public static boolean isNameValid(String name) {
        return name != null && !name.trim().isEmpty() && NAME_PATTERN.matcher(name).matches();
    }
    public static boolean isCodeFormatValid(String code) {
        return code != null && CODE_PATTERN.matcher(code).matches();
    }
    public static boolean isNumberOfSharesValid(long numberOfShares) {
        return numberOfShares >= MIN_SHARES && numberOfShares <= MAX_SHARES;
    }

    // --- 追加ここから ---
    private static final DateTimeFormatter DATE_TIME_INPUT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // 取引日時の形式と内容が正しいか
    public static boolean isTradedDateTimeValid(String dateTimeStr) {
        try {
            LocalDateTime dateTime = LocalDateTime.parse(dateTimeStr, DATE_TIME_INPUT_FORMATTER);
            DayOfWeek day = dateTime.getDayOfWeek();
            LocalTime time = dateTime.toLocalTime();

            // 未来の日付はNG
            if (dateTime.isAfter(LocalDateTime.now())) return false;
            // 土日はNG
            if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) return false;
            // 9:00前 or 15:30後はNG
            if (time.isBefore(LocalTime.of(9, 0)) || time.isAfter(LocalTime.of(15, 30))) return false;

            return true;
        } catch (DateTimeParseException e) {
            return false; // パースに失敗したら不正
        }
    }

    // 売買区分が正しいか
    public static boolean isSideValid(String side) {
        return "buy".equalsIgnoreCase(side) || "sell".equalsIgnoreCase(side);
    }

    // 数量が正しいか (100株単位の正の整数)
    public static boolean isQuantityValid(int quantity) {
        return quantity > 0 && quantity % 100 == 0;
    }

    // 取引単価が正しいか (0より大きい)
    public static boolean isPriceValid(BigDecimal price) {
        return price.compareTo(BigDecimal.ZERO) > 0;
    }
    // --- 追加ここまで ---
}

入力
// UserInputHandler.java (修正)
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Scanner;

public class UserInputHandler {
    private final Scanner scanner = new Scanner(System.in);

    // (既存のpromptNewStock関連メソッドはそのまま)
    public Stock promptNewStock(List<String> existingCodes) {
        // ... (省略) ...
        return new Stock(/* ... */);
    }
    // ... (省略) ...

    // --- 追加ここから ---
    public Trade promptNewTrade(List<String> existingStockCodes) {
        System.out.println("\n--- 取引入力 ---");

        LocalDateTime tradedDateTime = promptForTradedDateTime();
        String ticker = promptForTicker(existingStockCodes);
        Side side = promptForSide();
        int quantity = promptForQuantity();
        BigDecimal price = promptForPrice();

        return new Trade(tradedDateTime, ticker, side, quantity, price);
    }

    private LocalDateTime promptForTradedDateTime() {
        while (true) {
            System.out.print("取引日時 (yyyy-MM-dd HH:mm:ss) を入力してください: ");
            String input = scanner.nextLine();
            if (Validator.isTradedDateTimeValid(input)) {
                return LocalDateTime.parse(input, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            }
            System.err.println("エラー: 日時の形式または範囲が不正です。未来の日付、土日、9:00-15:30の範囲外は入力できません。");
        }
    }

    private String promptForTicker(List<String> existingStockCodes) {
        while (true) {
            System.out.print("銘柄コードを入力してください: ");
            String ticker = scanner.nextLine().toUpperCase();
            if (existingStockCodes.contains(ticker)) {
                return ticker;
            }
            System.err.println("エラー: その銘柄コードはマスタに存在しません。");
        }
    }

    private Side promptForSide() {
        while (true) {
            System.out.print("売買区分 (buy/sell) を入力してください: ");
            String input = scanner.nextLine();
            if (Validator.isSideValid(input)) {
                return Side.fromString(input);
            }
            System.err.println("エラー: 'buy' または 'sell' を入力してください。");
        }
    }

    private int promptForQuantity() {
        while (true) {
            System.out.print("数量 (100株単位) を入力してください: ");
            try {
                int quantity = Integer.parseInt(scanner.nextLine());
                if (Validator.isQuantityValid(quantity)) {
                    return quantity;
                }
                System.err.println("エラー: 100株単位の正の整数で入力してください。");
            } catch (NumberFormatException e) {
                System.err.println("エラー: 有効な数値を入力してください。");
            }
        }
    }

    private BigDecimal promptForPrice() {
        while (true) {
            System.out.print("取引単価を入力してください: ");
            try {
                BigDecimal price = new BigDecimal(scanner.nextLine());
                if (Validator.isPriceValid(price)) {
                    return price;
                }
                System.err.println("エラー: 0より大きい数値を入力してください。");
            } catch (NumberFormatException e) {
                System.err.println("エラー: 有効な数値を入力してください。");
            }
        }
    }
    // --- 追加ここまで ---
}

制御
// AppLogic.java (修正)
import java.io.IOException;
import java.util.List;

public class AppLogic {
    private final StockCsvReader reader;
    private final Displayer displayer;
    private final UserInputHandler inputHandler;
    private final CsvWriter stockWriter;
    private final TradeCsvWriter tradeWriter; // --- 追加

    private static final String STOCK_FILE_PATH = "stock_master.csv";
    private static final String TRADE_FILE_PATH = "trades.csv"; // --- 追加

    // --- コンストラクタ修正 ---
    public AppLogic(StockCsvReader reader, Displayer displayer, UserInputHandler inputHandler, CsvWriter stockWriter, TradeCsvWriter tradeWriter) {
        this.reader = reader;
        this.displayer = displayer;
        this.inputHandler = inputHandler;
        this.stockWriter = stockWriter;
        this.tradeWriter = tradeWriter; // --- 追加
    }

    // (processListStocks, processAddNewStock はそのまま)
    public void processListStocks() throws IOException { /* ... */ }
    public void processAddNewStock() throws IOException { /* ... */ }

    // --- 追加ここから ---
    public void processAddNewTrade() throws IOException {
        // バリデーション用に、存在する銘柄コードのリストを先に取得する
        List<String> existingStockCodes = reader.readAllTickerCodes(STOCK_FILE_PATH);
        if (existingStockCodes.isEmpty()) {
            System.err.println("エラー: 先に銘柄マスタを登録してください。");
            return;
        }

        // ユーザー入力からTradeオブジェクトを生成
        Trade newTrade = inputHandler.promptNewTrade(existingStockCodes);

        // ファイルに書き込み
        tradeWriter.write(TRADE_FILE_PATH, newTrade);
        System.out.println("\n銘柄コード " + newTrade.getTicker() + " の取引を記録しました。");
    }
    // --- 追加ここまで ---
}

// App.java (修正)
import java.io.IOException;
import java.util.Scanner;

public class App {
    private final Scanner menuScanner = new Scanner(System.in);

    public void run() {
        // --- 依存オブジェクトの生成 ---
        StockCsvReader reader = new StockCsvReader();
        Displayer displayer = new Displayer();
        UserInputHandler inputHandler = new UserInputHandler();
        CsvWriter stockWriter = new CsvWriter();
        TradeCsvWriter tradeWriter = new TradeCsvWriter(); // --- 追加
        // --- AppLogicにtradeWriterを渡す ---
        AppLogic appLogic = new AppLogic(reader, displayer, inputHandler, stockWriter, tradeWriter);

        System.out.println("株式取引管理システムを開始します。");
        while (true) {
            System.out.println("\n------------------------------------");
            System.out.println("操作するメニューを選んでください。");
            System.out.println("  A: 銘柄マスタ一覧表示");
            System.out.println("  B: 銘柄マスタ新規登録");
            System.out.println("  C: 取引入力"); // --- 追加
            System.out.println("  Q: アプリケーションを終了する");
            System.out.print("入力してください > ");
            String choice = menuScanner.nextLine().toUpperCase();

            try {
                switch (choice) {
                    case "A":
                        appLogic.processListStocks();
                        break;
                    case "B":
                        appLogic.processAddNewStock();
                        break;
                    // --- 追加ここから ---
                    case "C":
                        appLogic.processAddNewTrade();
                        break;
                    // --- 追加ここまで ---
                    case "Q":
                        System.out.println("アプリケーションを終了します。");
                        return;
                    default:
                        System.err.println("「" + choice + "」に対応するメニューは存在しません。");
                        break;
                }
            } catch (IOException e) {
                System.err.println("エラー: ファイルの読み書きに失敗しました。(" + e.getMessage() + ")");
            }
        }
    }

    public static void main(String[] args) {
        App app = new App();
        app.run();
    }
}



```
