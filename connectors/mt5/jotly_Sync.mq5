// jotly local-only closed deal exporter. By Bilal_tradess.
#property strict
int OnInit(){FolderCreate("jotly",FILE_COMMON);EventSetTimer(10);OnTimer();return(INIT_SUCCEEDED);}
void OnDeinit(const int reason){EventKillTimer();}
void OnTimer(){
 if(!HistorySelect(0,TimeCurrent()))return;
 int f=FileOpen("jotly\\closed_trades.csv",FILE_WRITE|FILE_CSV|FILE_ANSI|FILE_COMMON|FILE_SHARE_READ,',',CP_UTF8);
 if(f==INVALID_HANDLE){Print("jotly export failed: ",GetLastError());return;}
 FileWrite(f,"Deal","Symbol","Type","Volume","Open Time","Close Time","Open Price","Close Price","Commission","Swap","Profit");
 int count=HistoryDealsTotal();
 for(int i=0;i<count;i++){
  ulong ticket=HistoryDealGetTicket(i);if(ticket==0)continue;
  long entry=HistoryDealGetInteger(ticket,DEAL_ENTRY);
  if(entry!=DEAL_ENTRY_OUT&&entry!=DEAL_ENTRY_OUT_BY)continue;
  long type=HistoryDealGetInteger(ticket,DEAL_TYPE);if(type!=DEAL_TYPE_BUY&&type!=DEAL_TYPE_SELL)continue;
  long position=HistoryDealGetInteger(ticket,DEAL_POSITION_ID);
  datetime opened=(datetime)HistoryDealGetInteger(ticket,DEAL_TIME);double openPrice=0,openCommission=0;
  double closedVolume=HistoryDealGetDouble(ticket,DEAL_VOLUME),totalEntryVolume=0;
  // Preserve the original position direction and allocate entry commission to partial exits.
  for(int j=0;j<count;j++){
   ulong t=HistoryDealGetTicket(j);
   if(HistoryDealGetInteger(t,DEAL_POSITION_ID)!=position||HistoryDealGetInteger(t,DEAL_ENTRY)!=DEAL_ENTRY_IN)continue;
   datetime ot=(datetime)HistoryDealGetInteger(t,DEAL_TIME);if(ot>(datetime)HistoryDealGetInteger(ticket,DEAL_TIME))continue;
   double vol=HistoryDealGetDouble(t,DEAL_VOLUME);openPrice+=HistoryDealGetDouble(t,DEAL_PRICE)*vol;totalEntryVolume+=vol;
   openCommission+=HistoryDealGetDouble(t,DEAL_COMMISSION);if(ot<opened)opened=ot;
  }
  if(totalEntryVolume>0){openPrice/=totalEntryVolume;openCommission*=closedVolume/totalEntryVolume;}
  FileWrite(f,(string)ticket,HistoryDealGetString(ticket,DEAL_SYMBOL),type==DEAL_TYPE_SELL?"Buy":"Sell",DoubleToString(closedVolume,8),TimeToString(opened,TIME_DATE|TIME_SECONDS),TimeToString((datetime)HistoryDealGetInteger(ticket,DEAL_TIME),TIME_DATE|TIME_SECONDS),DoubleToString(openPrice,8),DoubleToString(HistoryDealGetDouble(ticket,DEAL_PRICE),8),DoubleToString(HistoryDealGetDouble(ticket,DEAL_COMMISSION)+openCommission,2),DoubleToString(HistoryDealGetDouble(ticket,DEAL_SWAP),2),DoubleToString(HistoryDealGetDouble(ticket,DEAL_PROFIT),2));
 }
 FileFlush(f);FileClose(f);
}
