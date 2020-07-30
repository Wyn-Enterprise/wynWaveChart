import '../style/visual.less';
//@ts-nocheck
import echarts from 'echarts';
//@ts-ignore
import liquidfill from 'echarts-liquidfill'
(window as any).q = liquidfill;
export default class Visual {
    private visualHost: any;
    private container: HTMLDivElement;
    private chart: any;
    private items: any;
    private properties: any;    
    private ActualValue: any;
    private TargetValue: any;

    static mockItems = 0.5;

    constructor(dom: HTMLDivElement, host: any) {
        this.container = dom;
        this.chart = require('echarts').init(dom)
        this.visualHost = host;
        this.fitSize();
        this.items = [];
        this.properties = {
            showSubTitle: false,
            actualValueSource: 'Dataset',
            constantActualValue: '50',
            targetValueSource: 'Dataset',
            constantTargetValue: '100',
            subtitle: 'Example',            
            shape: 'circle',
            borderWidth: 5,
            borderColor: '#1daaeb',
            waterColor: '#e6776c',
            backgroundColor: '#fff',
            fontSize: 35
        };
    }

    public update(options: any) {
        const dataView = options.dataViews[0];
        this.items = [];
        const calculationMode = options.properties.calculationMode;
        if ((dataView &&
            dataView.plain.profile.ActualValue.values.length && dataView.plain.profile.TargetValue.values.length &&
            options.properties.actualValueSource == "Dataset" && options.properties.targetValueSource == "Dataset")) {
            const plainData = dataView.plain;
            this.ActualValue = plainData.profile.ActualValue.values;
            this.TargetValue = plainData.profile.TargetValue.values;
            switch (calculationMode) {
                case "Ratio":
                    this.items = (plainData.data[0][this.ActualValue[0].display] / plainData.data[0][this.TargetValue[0].display]).toFixed(4);
                    break;
                case "Delta":
                    this.items = ((plainData.data[0][this.TargetValue[0].display] - plainData.data[0][this.ActualValue[0].display]) / plainData.data[0][this.TargetValue[0].display]).toFixed(4);
                    break;
            }
        } else if (options.properties.actualValueSource != "Dataset" && options.properties.targetValueSource != "Dataset" ) { 
            switch (calculationMode) {
                case "Ratio":
                    this.items = (options.properties.constantActualValue / options.properties.constantTargetValue).toFixed(4);
                    break;
                case "Delta":
                    this.items = ((options.properties.constantTargetValue - options.properties.constantActualValue) / options.properties.constantTargetValue).toFixed(4);
                    break;
            }
            
        } else if (options.properties.actualValueSource == "Dataset" && 
                    dataView && dataView.plain.profile.ActualValue.values.length && options.properties.targetValueSource != "Dataset") {
            const plainData = dataView.plain;
            this.ActualValue = plainData.profile.ActualValue.values;
            switch (calculationMode) {
                case "Ratio":
                    this.items = (plainData.data[0][this.ActualValue[0].display] / options.properties.constantTargetValue).toFixed(4);
                    break;
                case "Delta":
                    this.items = ((options.properties.constantTargetValue - plainData.data[0][this.ActualValue[0].display]) / options.properties.constantTargetValue).toFixed(4);
                    break;
            }

        } else if (options.properties.actualValueSource != "Dataset" && 
                    dataView && dataView.plain.profile.TargetValue.values.length && options.properties.targetValueSource == "Dataset") {
            const plainData = dataView.plain;
            this.TargetValue = plainData.profile.TargetValue.values;
            switch (calculationMode) {
                case "Ratio":
                    this.items = (options.properties.constantActualValue / plainData.data[0][this.TargetValue[0].display]).toFixed(4);
                    break;
                case "Delta":
                    this.items = ((plainData.data[0][this.TargetValue[0].display] - options.properties.constantActualValue) / plainData.data[0][this.TargetValue[0].display]).toFixed(4);
                    break;
            }
            
        }
        this.properties = options.properties;
        this.render();
    };

    private render() {
        this.chart.clear();
        const isMock = !this.items.length;
        const items = isMock ? Visual.mockItems : this.items;
        this.container.style.opacity = isMock ? '0.3' : '1';
        const options = this.properties;
        const option = {
            series: [{
                type: 'liquidFill',
                radius: '75%',
                name: options.subtitle,
                shape: options.shape,
                center: ['50%', '50%'],
                data: [items, items * 0.9, items * 0.8, items * 0.7],
                color: [options.waterColor],
                backgroundStyle: {
                    borderWidth: options.borderWidth,
                    borderColor: options.borderColor,
                    color: options.backgroundColor
                },
                label: {
                    formatter: function () {
                        return options.showSubTitle ? (items * 100).toFixed(2) + '%\n' + options.subtitle : (items * 100).toFixed(2) + '%';
                    },
                    fontSize: options.fontSize
                }
            }]
        };
        this.chart.setOption(option);
    }

    // Adaptive size
    private fitSize() {
        this.chart.resize();
    }

    // public abstract onDestroy(): void;
    public onResize() {
        this.fitSize();
        this.render();
    }

    // Custom attribute visibility
    public getInspectorHiddenState(updateOptions: any): string[] {
        const blackList : string[] = [];
        
        if (!updateOptions.properties.showSubTitle) {
            blackList.push('subtitle');
        }
        if (updateOptions.properties.actualValueSource == "Dataset") {
            blackList.push('constantActualValue');
        }
        if (updateOptions.properties.targetValueSource == "Dataset") {
            blackList.push('constantTargetValue');
        }
        return blackList;
    }

    // Function button visibility
    public getActionBarHiddenState(updateOptions: any): string[] {
        return null;
    }
    public onActionEventHandler = (name: string) => {
        console.log(name);
    }
}