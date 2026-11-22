// jotly local-only closed order exporter. By Bilal_tradess.
#property strict
int OnInit(){FolderCreate("jotly");EventSetTimer(10);OnTimer();return(INIT_SUCCEEDED);}
void OnDeinit(const int reason){EventKillTimer();}
void OnTimer(){
 int f=FileOpen("jotly\\closed_trades.csv",FILE_WRITE|FILE_CSV|FILE_ANSI|FILE_SHARE_READ,',',CP_UTF8);
 if(f==INVALID_HANDLE){Print("jotly export failed: ",GetLastError());return;}
 FileWrite(f,"Ticket","Symbol","Type","Volume","Open Time","Close Time","Open Price","Close Price","Commission","Swap","Profit");
 for(int i=0;i<OrdersHistoryTotal();i++){
  if(!OrderSelect(i,SELECT_BY_POS,MODE_HISTORY))continue;
  if(OrderType()!=OP_BUY&&OrderType()!=OP_SELL)continue;
  FileWrite(f,IntegerToString(OrderTicket()),OrderSymbol(),OrderType()==OP_BUY?"Buy":"Sell",DoubleToString(OrderLots(),8),TimeToString(OrderOpenTime(),TIME_DATE|TIME_SECONDS),TimeToString(OrderCloseTime(),TIME_DATE|TIME_SECONDS),DoubleToString(OrderOpenPrice(),8),DoubleToString(OrderClosePrice(),8),DoubleToString(OrderCommission(),2),DoubleToString(OrderSwap(),2),DoubleToString(OrderProfit(),2));
 }
 FileFlush(f);FileClose(f);
}
